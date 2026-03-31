const XLSX = require('xlsx');
const fs = require('fs');
const ImportLog = require('../models/ImportLog');
const AppError = require('../utils/AppError');
const collegeService = require('./collegeService');
const courseService = require('./courseService');
const examService = require('./examService');
const userService = require('./userService');
const blogService = require('./blogService');
const reviewService = require('./reviewService');
const enquiryService = require('./enquiryService');
const collegeCourseService = require('./collegeCourseService');
const AccreditationBody = require('../models/AccreditationBody');
const BaseService = require('./baseService');
const accreditationService = new BaseService(AccreditationBody);

// ─── Enum lists (must match College.js model exactly) ────────────────────────

const COLLEGE_TYPE_ENUMS = [
  'Engineering & Technology','Medical & Health Sciences','Management & Business',
  'Law','Arts & Science','Architecture & Planning','Pharmacy','Agriculture',
  'Education & Teaching','Design & Fine Arts','Commerce & Finance','Technical','Multi-Disciplinary',
];

const FUNDING_TYPE_ENUMS = [
  'Government','Private','Semi-Government','Public-Private Partnership',
  'Deemed University','Private University','Central University','State University',
  'Autonomous','Minority Institution',
  'Autonomous College','National Institute','National Law University',
  'Institute of National Importance','Deemed to be University',
  'Open University','Agricultural University',
];

// Regex aliases for fuzzy fundingType resolution
const FUNDING_TYPE_ALIASES = [
  [/national\s+law\s+university/i,            'National Law University'],
  [/national\s+institute/i,                   'National Institute'],
  [/institute\s+of\s+national\s+importance/i, 'Institute of National Importance'],
  [/deemed\s+to\s+be/i,                       'Deemed to be University'],
  [/deemed\s+university/i,                    'Deemed University'],
  [/autonomous\s+college/i,                   'Autonomous College'],
  [/autonomous/i,                             'Autonomous'],
  [/central\s+university/i,                   'Central University'],
  [/state\s+university/i,                     'State University'],
  [/private\s+university/i,                   'Private University'],
  [/open\s+university/i,                      'Open University'],
  [/agricultural\s+university/i,              'Agricultural University'],
  [/minority/i,                               'Minority Institution'],
  [/semi.?government/i,                       'Semi-Government'],
  [/government|govt|public.?funded/i,         'Government'],
  [/private/i,                                'Private'],
];

const CAMPUS_TYPE_ENUMS = [
  'Urban','Semi-Urban','Rural','Suburban',
  'Residential','Non-Residential','Semi-Residential',
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function matchEnum(input, enumValues, fallback) {
  if (input === undefined || input === null || input === '') return fallback;
  const s = String(input).trim();
  const exact = enumValues.find(v => v.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  const partial = enumValues.find(
    v => v.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(v.toLowerCase())
  );
  return partial !== undefined ? partial : fallback;
}

function resolveFundingType(raw) {
  if (!raw) return undefined;
  const s = String(raw).trim();
  const enumMatch = matchEnum(s, FUNDING_TYPE_ENUMS);
  if (enumMatch) return enumMatch;
  for (const [pattern, canonical] of FUNDING_TYPE_ALIASES) {
    if (pattern.test(s)) return canonical;
  }
  return undefined; // unknown value → omit entirely to avoid Mongoose enum error
}

/**
 * Resolve admissionProcess.mode from a raw Excel cell.
 *
 * Excel sheets commonly put an exam name (JEE Advanced, CAT, NEET…) in the
 * "Admission Mode" column instead of a valid enum value.
 * We detect this and return:
 *   mode            = 'Entrance-Based'  (valid enum)
 *   entranceExamName = the original string (stored in the new free-text field)
 */
function resolveAdmissionMode(raw) {
  if (!raw) return { mode: undefined, entranceExamName: undefined };
  const s = String(raw).trim();
  const l = s.toLowerCase();

  if (['merit-based','merit based','merit'].includes(l))
    return { mode: 'Merit-Based', entranceExamName: undefined };
  if (['entrance-based','entrance based','entrance'].includes(l))
    return { mode: 'Entrance-Based', entranceExamName: undefined };
  if (l === 'both')
    return { mode: 'Both', entranceExamName: undefined };
  if (l === 'direct' || l === 'direct admission')
    return { mode: 'Merit-Based', entranceExamName: undefined };

  // Contains "direct" alongside an exam name → Both
  if (l.includes('direct') && (l.includes('/') || l.includes('+')))
    return { mode: 'Both', entranceExamName: s };

  // Anything else is an exam name → Entrance-Based
  return { mode: 'Entrance-Based', entranceExamName: s };
}

// Strip undefined/null keys so Mongoose enum validation is not triggered on absent fields
function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ImportExportService {
  constructor() {
    this.modelMapping = {
      College: collegeService, Course: courseService, Exam: examService,
      User: userService, Blog: blogService, Review: reviewService,
      AdmissionEnquiry: enquiryService, CollegeCourse: collegeCourseService,
      AccreditationBody: accreditationService,
    };
  }

  generateBatchId() {
    return 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  parseExcel(filePath) {
    const wb = XLSX.readFile(filePath);
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  }

  normalizeRow(row) {
    const out = {};
    for (const k of Object.keys(row)) {
      // Remove BOM, strip ALL unicode whitespace (including non-breaking space \u00a0,
      // zero-width space \u200b, etc.), collapse multiple spaces, lowercase
      const normalized = k
        .replace(/^\uFEFF/, '')
        .replace(/[\u00a0\u200b\u200c\u200d\u2060\ufeff]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      out[normalized] = row[k];
    }
    return out;
  }

  makeGet(n) {
    return (...keys) => {
      for (const k of keys) {
        const v = n[k.toLowerCase().trim()];
        if (v !== undefined && v !== '') return v;
      }
      return undefined;
    };
  }

  toNum(v)  { return (v !== undefined && v !== '') ? Number(v) : undefined; }
  toArr(v)  { return v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : []; }
  toBool(v) { return String(v ?? '').trim().toLowerCase() === 'yes'; }

  // ── IMPORT ──────────────────────────────────────────────────────────────────

  async importFromExcel(filePath, modelName, userId) {
    const batchId = this.generateBatchId();
    await ImportLog.create({ batchId, model: modelName, fileUrl: filePath, status: 'processing', startedBy: userId });

    try {
      const data    = this.parseExcel(filePath);
      const service = this.modelMapping[modelName];
      if (!service) throw new AppError('No service for model ' + modelName, 400);

      const totalRows = data.length;
      let succeededRows = 0, failedRows = 0;
      const importErrors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const mapped = this.mapRowToModel(data[i], modelName);
          if      (modelName === 'College') await service.upsertCollege(mapped);
          else if (modelName === 'Course')  await service.createCourse(mapped);
          else if (modelName === 'Exam')    await service.createExam(mapped);
          else                              await service.create(mapped);
          succeededRows++;
        } catch (err) {
          failedRows++;
          importErrors.push({ row: i + 2, field: 'general', message: err.message || String(err) });
          if (process.env.NODE_ENV !== 'production') console.warn('[Import row ' + (i + 2) + ']', err.message);
        }
        if ((i + 1) % 50 === 0) await ImportLog.updateOne({ batchId }, { processedRows: i + 1, succeededRows, failedRows, importErrors });
      }

      const finalStatus = failedRows === 0 ? 'completed' : succeededRows > 0 ? 'partial' : 'failed';
      await ImportLog.updateOne({ batchId }, {
        status: finalStatus, totalRows, processedRows: totalRows,
        succeededRows, failedRows, importErrors, completedAt: new Date(),
      });
      return { batchId, totalRows, succeededRows, failedRows, importErrors };
    } catch (error) {
      await ImportLog.updateOne({ batchId }, {
        status: 'failed', completedAt: new Date(),
        importErrors: [{ row: 0, field: 'general', message: error.message }],
      });
      throw error;
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

    flattenDocForExport(doc, modelName) {
    if (modelName === 'College') {
      return {
        'College Name':                doc.name || '',
        'Short Name':                  doc.shortName || '',
        'Logo URL':                    doc.logoUrl || '',
        'Description':                 doc.description || '',
        'College Type':                doc.collegeType || '',
        'Institute Type (Funding Type)': doc.fundingType || '',
        'Affiliation':                 doc.affiliation || '',
        'Established Year':            doc.establishmentYear || '',
        'NAAC Grade':                  doc.accreditation?.naacGrade || '',
        'NIRF Rank':                   doc.accreditation?.nirfRank || '',
        'NBA Status':                  doc.accreditation?.nbaStatus ? 'Yes' : 'No',
        'Other Accreditations':        (doc.accreditation?.otherAccreditations || []).join(', '),
        'Phone':                       doc.contact?.phone || '',
        'Email':                       doc.contact?.email || '',
        'Website':                     doc.contact?.website || '',
        'Address':                     doc.contact?.address || '',
        'City':                        doc.contact?.city || '',
        'State':                       doc.contact?.state || '',
        'Pincode':                     doc.contact?.pincode || '',
        'Latitude':                    doc.contact?.latitude || '',
        'Longitude':                   doc.contact?.longitude || '',
        'Average Package (LPA)':       doc.placementStats?.averagePackage || '',
        'Highest Package (LPA)':       doc.placementStats?.highestPackage || '',
        'Median Package (LPA)':        doc.placementStats?.medianPackage || '',
        'Placement Rate (%)':          doc.placementStats?.placementPercentage || '',
        'Placement Year':              doc.placementStats?.year || '',
        'Top Recruiters':              (doc.placementStats?.topRecruiters || []).join(', '),
        'Tuition Fee (₹/yr)':          doc.fees?.tuitionFee || '',
        'Hostel Fee (₹/yr)':           doc.fees?.hostelFee || '',
        'Other Fees (₹/yr)':           doc.fees?.otherFees || '',
        'Total Fees (₹/yr)':           doc.fees?.total || '',
        'Approved By':                 (doc.approvedBy || []).join(', '),
        'Total Area (Acres)':          doc.campusInfo?.totalArea || '',
        'Campus Type':                 doc.campusInfo?.campusType || '',
        'Total Students':              doc.campusInfo?.totalStudents || '',
        'Total Faculty':               doc.campusInfo?.totalFaculty || '',
        'Student-Faculty Ratio':       doc.campusInfo?.studentFacultyRatio || '',
        'Departments':                 doc.campusInfo?.departments || '',
        'Hostel Available':            doc.hostel?.available ? 'Yes' : 'No',
        'Boys Capacity':               doc.hostel?.boysCapacity || '',
        'Girls Capacity':              doc.hostel?.girlsCapacity || '',
        'Hostel Annual Fee (₹)':       doc.hostel?.annualFee || '',
        'Mess Charges (₹)':            doc.hostel?.messCharges || '',
        'Hostel Distance from Campus': doc.hostel?.distanceFromCampus || '',
        'Hostel Facilities':           (doc.hostel?.facilities || []).join(', '),
        'Admission Mode':              doc.admissionProcess?.mode || '',
        'Application Fee (₹)':        doc.admissionProcess?.applicationFee || '',
        'Application Link':            doc.admissionProcess?.applicationLink || '',
        'Documents Required':          (doc.admissionProcess?.documentsRequired || []).join(', '),
        'Facebook':                    doc.socialMedia?.facebook || '',
        'Twitter':                     doc.socialMedia?.twitter || '',
        'Instagram':                   doc.socialMedia?.instagram || '',
        'LinkedIn':                    doc.socialMedia?.linkedin || '',
        'YouTube':                     doc.socialMedia?.youtube || '',
        'Verified':                    doc.isVerified ? 'Yes' : 'No',
        'Featured':                    doc.featured ? 'Yes' : 'No',
        'SEO Title':                   doc.seo?.metaTitle || '',
        'SEO Description':             doc.seo?.metaDescription || '',
        'SEO Keywords':                (doc.seo?.keywords || []).join(', '),
      };
    }
    if (modelName === 'Course') {
      return {
        'Course Name':              doc.name || '',
        'Level':                    doc.category || '',
        'Discipline':               doc.discipline || '',
        'Duration':                 doc.duration || '',
        'Mode':                     doc.mode || '',
        'Description':              doc.description || '',
        'Eligibility Criteria':     doc.eligibility || '',
        'Admission Type':           doc.admissionType || '',
        'Specializations':          (doc.specializations || []).join(', '),
        'Job Roles':                (doc.jobRoles || []).join(', '),
        'Skills':                   (doc.skills || []).join(', '),
        'Minimum Fee (INR/Year)':   doc.feeRange?.min || '',
        'Maximum Fee (INR/Year)':   doc.feeRange?.max || '',
      };
    }
    if (modelName === 'Exam') {
      return {
        'Exam Name':          doc.name || '',
        'Category':           doc.category || '',
        'Conducting Body':    doc.conductingBody || '',
        'Overview':           doc.overview || '',
        'Eligibility':        doc.eligibility || '',
        'Official Website':   doc.officialWebsite || '',
        'Exam Level':         doc.examLevel || '',
        'Exam Mode':          doc.examMode || '',
        'Languages':          (doc.examLanguages || []).join(', '),
        'Frequency':          doc.frequency || '',
        'Registration Fee':   doc.registrationFee || '',
        'Total Applications': doc.totalApplications || '',
      };
    }
    if (modelName === 'Blog') {
      return {
        'Title':   doc.title || '',
        'Content': doc.content || '',
        'Excerpt': doc.excerpt || '',
        'Status':  doc.status || '',
        'Tags':    (doc.tags || []).join(', '),
      };
    }
    if (modelName === 'AccreditationBody') {
      return {
        'Abbreviation': doc.abbr || '',
        'Full Name':    doc.full || '',
        'Logo URL':     doc.logoUrl || '',
        'Order':        doc.order ?? '',
        'Active':       doc.active ? 'Yes' : 'No',
      };
    }

    // Fallback for other models — basic flatten
    const flat = {};
    for (const [k, v] of Object.entries(doc)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) flat[k] = JSON.stringify(v);
      else if (Array.isArray(v)) flat[k] = v.join(', ');
      else flat[k] = v;
    }
    return flat;
  }

  // ── EXPORT ──────────────────────────────────────────────────────────────────

  async exportToExcel(modelName, filter = {}) {
    const service = this.modelMapping[modelName];
    if (!service) throw new AppError('No service for model ' + modelName, 400);
    const { data } = await service.findAll({ ...filter, deletedAt: null }, { limit: 10000 }, {});
    const rows = data.map(doc => this.flattenDocForExport(doc, modelName));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), modelName);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }


  // ── TEMPLATE GENERATION ─────────────────────────────────────────────────────

  generateTemplate(modelName) {
    const TEMPLATES = {
      College: {
        headers: [
          'College Name', 'Short Name', 'Logo URL', 'Description',
          'College Type', 'Institute Type (Funding Type)', 'Affiliation',
          'Established Year',
          'NAAC Grade', 'NIRF Rank', 'NBA Status',
          'Other Accreditations',
          'Phone', 'Email', 'Website', 'Address', 'City', 'State', 'Pincode',
          'Latitude', 'Longitude',
          'Average Package (LPA)', 'Highest Package (LPA)', 'Median Package (LPA)',
          'Placement Rate (%)', 'Placement Year', 'Top Recruiters',
          'Tuition Fee (₹/yr)', 'Hostel Fee (₹/yr)', 'Other Fees (₹/yr)', 'Total Fees (₹/yr)',
          'Approved By',
          'Total Area (Acres)', 'Campus Type', 'Total Students', 'Total Faculty',
          'Student-Faculty Ratio', 'Departments',
          'Hostel Available', 'Boys Capacity', 'Girls Capacity',
          'Hostel Annual Fee (₹)', 'Mess Charges (₹)', 'Hostel Distance from Campus',
          'Hostel Facilities',
          'Admission Mode', 'Application Fee (₹)', 'Application Link',
          'Documents Required',
          'Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube',
          'Verified', 'Featured',
          'SEO Title', 'SEO Description', 'SEO Keywords',
        ],
        sample: {
          'College Name': 'Indian Institute of Technology Delhi',
          'Short Name': 'IIT Delhi',
          'Logo URL': 'https://cdn.example.com/iitd-logo.png',
          'Description': 'Premier engineering institution in India',
          'College Type': 'Engineering & Technology',
          'Institute Type (Funding Type)': 'Institute of National Importance',
          'Affiliation': 'Autonomous',
          'Established Year': 1961,
          'NAAC Grade': 'A++',
          'NIRF Rank': 2,
          'NBA Status': 'Yes',
          'Other Accreditations': 'ABET, NBA',
          'Phone': '01126591000',
          'Email': 'info@iitd.ac.in',
          'Website': 'https://home.iitd.ac.in',
          'Address': 'Hauz Khas',
          'City': 'New Delhi',
          'State': 'Delhi',
          'Pincode': '110016',
          'Latitude': 28.5454,
          'Longitude': 77.1926,
          'Average Package (LPA)': 20,
          'Highest Package (LPA)': 2.8,
          'Placement Rate (%)': 85,
          'Placement Year': 2024,
          'Top Recruiters': 'Google, Microsoft, Amazon',
          'Tuition Fee (₹/yr)': 200000,
          'Total Fees (₹/yr)': 300000,
          'Approved By': 'UGC, AICTE',
          'Total Area (Acres)': '325',
          'Campus Type': 'Urban',
          'Total Students': 10000,
          'Total Faculty': 600,
          'Student-Faculty Ratio': '16:1',
          'Departments': 13,
          'Hostel Available': 'Yes',
          'Boys Capacity': 7000,
          'Girls Capacity': 2000,
          'Admission Mode': 'Entrance-Based',
          'Verified': 'Yes',
          'Featured': 'Yes',
        },
        notes: [
          ['Field', 'Valid Values / Notes'],
          ['College Type', 'Engineering & Technology | Medical & Health Sciences | Management & Business | Law | Arts & Science | Architecture & Planning | Pharmacy | Agriculture | Education & Teaching | Design & Fine Arts | Commerce & Finance | Technical | Multi-Disciplinary'],
          ['Institute Type (Funding Type)', 'Government | Private | Semi-Government | Public-Private Partnership | Deemed University | Private University | Central University | State University | Autonomous | Minority Institution | Autonomous College | National Institute | National Law University | Institute of National Importance | Deemed to be University | Open University | Agricultural University'],
          ['NAAC Grade', 'A++ | A+ | A | B++ | B+ | B | C'],
          ['NBA Status', 'Yes | No'],
          ['Campus Type', 'Urban | Semi-Urban | Rural | Suburban | Residential | Non-Residential | Semi-Residential'],
          ['Admission Mode', 'Merit-Based | Entrance-Based | Both  (or paste the entrance exam name e.g. JEE Advanced)'],
          ['Hostel Available / Verified / Featured', 'Yes | No'],
          ['Top Recruiters / Approved By / Other Accreditations / Hostel Facilities / Documents Required', 'Comma-separated values  e.g.  Google, Microsoft, Amazon'],
          ['Logo URL', 'Direct URL to the college logo image  (PNG/JPG/WebP)'],
          ['Package fields (LPA)', 'Enter numeric value in Lakhs Per Annum  e.g. 12.5  (not 12.5 LPA)'],
          ['Fee fields (₹/yr)', 'Enter numeric value in Rupees per year  e.g. 200000  (not 2 Lakh)'],
        ],
      },
      Course: {
        headers: [
          'Course Name', 'Level', 'Discipline', 'Duration', 'Mode',
          'Description', 'Eligibility Criteria', 'Admission Type',
          'Specializations', 'Job Roles', 'Skills',
          'Minimum Fee (INR/Year)', 'Maximum Fee (INR/Year)',
        ],
        sample: {
          'Course Name': 'Bachelor of Technology (Computer Science)',
          'Level': 'UG',
          'Discipline': 'Engineering & Technology',
          'Duration': '4 Years',
          'Mode': 'Full-time',
          'Description': 'Undergraduate engineering programme in Computer Science',
          'Eligibility Criteria': '10+2 with PCM, JEE Main/Advanced qualified',
          'Specializations': 'AI, Data Science, Cybersecurity',
          'Job Roles': 'Software Engineer, Data Analyst, Product Manager',
          'Skills': 'Python, Java, Data Structures, Machine Learning',
          'Minimum Fee (INR/Year)': 150000,
          'Maximum Fee (INR/Year)': 400000,
        },
        notes: [
          ['Field', 'Valid Values / Notes'],
          ['Level', 'UG | PG | Diploma | Doctorate | Certificate'],
          ['Mode', 'Full-time | Part-time | Online | Distance'],
          ['Specializations / Job Roles / Skills', 'Comma-separated values'],
          ['Fee fields', 'Numeric, in Rupees per year'],
        ],
      },
      Exam: {
        headers: [
          'Exam Name', 'Category', 'Conducting Body', 'Overview', 'Eligibility',
          'Official Website', 'Exam Level', 'Exam Mode', 'Languages', 'Frequency',
          'Registration Fee', 'Total Applications',
        ],
        sample: {
          'Exam Name': 'JEE Main',
          'Category': 'UG',
          'Conducting Body': 'National Testing Agency (NTA)',
          'Overview': 'Joint Entrance Examination for B.Tech admissions at NITs, IIITs and GFTIs',
          'Eligibility': '10+2 with PCM, minimum 75% marks',
          'Official Website': 'https://jeemain.nta.nic.in',
          'Exam Level': 'National',
          'Exam Mode': 'Online (CBT)',
          'Languages': 'English, Hindi, Regional languages',
          'Frequency': 'Twice a Year',
          'Registration Fee': 1000,
          'Total Applications': 1200000,
        },
        notes: [
          ['Field', 'Valid Values / Notes'],
          ['Category', 'UG | PG | PhD | Diploma'],
          ['Exam Level', 'National | State | University-Level | Institute-Level'],
          ['Exam Mode', 'Online (CBT) | Offline (OMR) | Online + Offline | Remote Proctored'],
          ['Frequency', 'Annual | Twice a Year | Multiple Times | As per notification'],
          ['Languages', 'Comma-separated  e.g.  English, Hindi'],
          ['Registration Fee', 'Numeric, in Rupees'],
        ],
      },
      Blog: {
        headers: ['Title', 'Content', 'Excerpt', 'Status', 'Tags'],
        sample: {
          'Title': 'Top 10 Engineering Colleges in India 2025',
          'Content': 'Full article content here...',
          'Excerpt': 'A curated list of the best engineering colleges in India ranked by NIRF 2025.',
          'Status': 'draft',
          'Tags': 'engineering, rankings, NIRF, IIT',
        },
        notes: [
          ['Field', 'Valid Values / Notes'],
          ['Status', 'draft | published'],
          ['Tags', 'Comma-separated keywords'],
        ],
      },
      AdmissionEnquiry: {
        headers: ['Student Name', 'Phone', 'Email', 'Message', 'Preferred City', 'Source'],
        sample: {
          'Student Name': 'Rahul Sharma',
          'Phone': '9876543210',
          'Email': 'rahul@example.com',
          'Message': 'Interested in B.Tech admissions',
          'Preferred City': 'Delhi',
          'Source': 'website',
        },
        notes: [
          ['Field', 'Valid Values / Notes'],
          ['Phone', '10-digit mobile number without country code'],
          ['Source', 'website | referral | social | ads | other'],
        ],
      },
      AccreditationBody: {
        headers: ['Abbreviation', 'Full Name', 'Logo URL', 'Order', 'Active'],
        sample: {
          'Abbreviation': 'NAAC',
          'Full Name':    'National Assessment and Accreditation Council',
          'Logo URL':     'https://cdn.example.com/naac.png',
          'Order':        '1',
          'Active':       'Yes',
        },
      },

    };

    const tpl = TEMPLATES[modelName];
    if (!tpl) throw new AppError('No template for model ' + modelName, 400);

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Data (headers + one sample row) ──────────────────────────────
    const dataRows = [tpl.sample];
    const dataSheet = XLSX.utils.json_to_sheet(dataRows, { header: tpl.headers });

    // Bold + gold fill the header row
    const headerStyle = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1C1C1E' } }, alignment: { wrapText: true } };
    const sampleStyle  = { fill: { fgColor: { rgb: 'FFF9EC' } }, alignment: { wrapText: true } };

    tpl.headers.forEach((h, colIdx) => {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!dataSheet[cellAddr]) dataSheet[cellAddr] = { v: h, t: 's' };
      dataSheet[cellAddr].s = headerStyle;

      const sampleAddr = XLSX.utils.encode_cell({ r: 1, c: colIdx });
      if (dataSheet[sampleAddr]) dataSheet[sampleAddr].s = sampleStyle;
    });

    // Auto column widths
    dataSheet['!cols'] = tpl.headers.map(h => ({ wch: Math.max(h.length + 2, 18) }));

    XLSX.utils.book_append_sheet(wb, dataSheet, 'Data');

    // ── Sheet 2: Notes (valid values) ─────────────────────────────────────────
    const notesSheet = XLSX.utils.aoa_to_sheet(tpl.notes);
    notesSheet['!cols'] = [{ wch: 35 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(wb, notesSheet, 'Notes — Valid Values');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  // ── ROW MAPPING ─────────────────────────────────────────────────────────────

  mapRowToModel(row, modelName) {
    if (modelName === 'College') return this.mapCollege(row);
    if (modelName === 'Course')  return this.mapCourse(row);
    if (modelName === 'Exam')    return this.mapExam(row);
    if (modelName === 'Blog')    return this.mapBlog(row);
    if (modelName === 'AccreditationBody') {
      const n = this.normalizeRow(row);
      const get = this.makeGet(n);
      return {
        abbr:    get('abbreviation', 'abbr')    || '',
        full:    get('full name', 'full')       || '',
        logoUrl: get('logo url', 'logourl')     || '',
        order:   this.toNum(get('order'))       ?? 0,
        active:  get('active') ? this.toBool(get('active')) : true,
      };
    }

    return row;
  }

  mapCollege(row) {
    const n   = this.normalizeRow(row);
    const get = this.makeGet(n);
    const { toNum, toArr, toBool } = this;

    const name = get('college name','name','institution name','college');
    if (!name) throw new Error('Missing required field: College Name');

    const rawAdmMode = get('admission mode','admissionmode','admission process','entrance exam','admission');
    const { mode: admMode, entranceExamName } = resolveAdmissionMode(rawAdmMode);

    return {
      name: String(name).trim(),
      shortName:         get('short name','shortname','abbreviation'),
      logoUrl:           get('logo url','logourl','logo','college logo','logo url (png/jpg/webp)','logo_url','logo-url','college logo url','image url','logo link'),
      description:       get('description','about','overview') || '',
      establishmentYear: toNum(get('established year','establishedyear','year established','founded')),

      collegeType: matchEnum(
        get('discipline','college type','collegetype','type of college','academic focus','stream'),
        COLLEGE_TYPE_ENUMS
      ),

      fundingType: resolveFundingType(
        get('institute type (funding type)','institute type','funding type','fundingtype','ownership','management type','management','type')
      ),  


      affiliation: get('affiliation','affiliated to','university','affiliated university'),

      accreditation: clean({
        naacGrade: get('naac grade','naacgrade','naac'),
        nbaStatus: get('nba status','nbastatus','nba') !== undefined
                     ? toBool(get('nba status','nbastatus','nba')) : undefined,
        nirfRank:  toNum(get('nirf ranking','nirfrank','nirf rank','nirf')),
        otherAccreditations: toArr(get('other accreditations','otheraccreditations')).length
                               ? toArr(get('other accreditations','otheraccreditations')) : undefined,
      }),

      contact: clean({
        phone:     get('phone','contact phone','mobile','telephone')
                     ? String(get('phone','contact phone','mobile','telephone')) : undefined,
        email:     get('email','contact email','official email'),
        website:   get('website','official website','url','web'),
        address:   get('address','full address','street address'),
        city:      get('city','location','location city'),
        state:     get('state','location state','province'),
        country:   get('country') || 'India',
        pincode:   get('pincode','pin code','zip','postal code')
                     ? String(get('pincode','pin code','zip','postal code')) : undefined,
        latitude:  toNum(get('latitude','lat')),
        longitude: toNum(get('longitude','lng','lon','long')),
      }),

      rankings: (() => {
        const rank = toNum(get('nirf ranking','nirfrank','nirf rank','nirf','ranking rank','rank'));
        if (!rank) return [];
        const year = toNum(get('ranking year','rankingyear','nirf year')) || new Date().getFullYear();
        return [{ year, rank, source: get('ranking source','rankingsource') || 'NIRF', category: 'Overall' }];
      })(),

      placementStats: clean({
        averagePackage:      toNum(get('average package (lpa)','average package','avg package','averagepackage')),
        highestPackage:      toNum(get('highest package (lpa)','highest package','max package','highestpackage')),
        medianPackage:       toNum(get('median package (lpa)','median package','medianpackage')),
        placementPercentage: toNum(get('placement rate (%)','placement rate','placement %','placementpercentage','placements')),
        year:                toNum(get('placement year','placementyear')),
        topRecruiters:       toArr(get('top recruiters','toprecruiters','recruiters')).length
                               ? toArr(get('top recruiters','toprecruiters','recruiters')) : undefined,
      }),

      fees: clean({
        tuitionFee: toNum(get('tuition fee (₹/yr)','tuition fee','tuitionfee','annual fee')),
        hostelFee:  toNum(get('hostel fee (₹/yr)','hostel fee','hostelfee')),
        otherFees:  toNum(get('other fees (₹/yr)','other fees','otherfees')),
        total:      toNum(get('total fees (₹/yr)','total fees','totalfees','fees','total annual fee')),
      }),

      approvedBy: toArr(get('approved by','approvedby','approvals','regulatory bodies')),

      campusInfo: clean({
        totalArea:           get('total area (acres)','total area','campus area','area'),
        campusType:          matchEnum(get('campus type','campustype','campus'), CAMPUS_TYPE_ENUMS),
        totalStudents:       toNum(get('total students','totalstudents','students enrolled')),
        totalFaculty:        toNum(get('total faculty','totalfaculty','faculty count')),
        studentFacultyRatio: get('student-faculty ratio','studentfacultyratio','s:f ratio'),
        departments:         toNum(get('departments','no. of departments','dept count')),
        recognitions:        toArr(get('recognitions','awards')).length
                               ? toArr(get('recognitions','awards')) : undefined,
      }),

      hostel: clean({
        available:          toBool(get('hostel available','hostelavailable','hostel')) || false,
        boysCapacity:       toNum(get('boys capacity','boyscapacity')),
        girlsCapacity:      toNum(get('girls capacity','girlscapacity')),
        annualFee:          toNum(get('hostel annual fee (₹)','hostel annual fee','hostelannualfee')),
        messCharges:        toNum(get('mess charges (₹)','mess charges','messcharges')),
        facilities:         toArr(get('hostel facilities','hostelfacilities')).length
                              ? toArr(get('hostel facilities','hostelfacilities')) : undefined,
        distanceFromCampus: get('hostel distance from campus','hosteldistance'),
      }),

      admissionProcess: clean({
        mode:             admMode,           // always a valid enum or undefined
        entranceExamName: entranceExamName,  // free-text, no enum constraint
        applicationFee:   toNum(get('application fee (₹)','applicationfee','application fee')),
        applicationLink:  get('application link','applicationlink','apply link'),
        documentsRequired: toArr(get('documents required','documentsrequired')).length
                             ? toArr(get('documents required','documentsrequired')) : undefined,
        steps: [],
      }),

      socialMedia: clean({
        facebook:  get('facebook'),
        twitter:   get('twitter','x (twitter)','x'),
        instagram: get('instagram'),
        linkedin:  get('linkedin'),
        youtube:   get('youtube'),
      }),

      isVerified: toBool(get('verified','is verified')) || false,
      featured:   toBool(get('featured','is featured'))  || false,

      seo: clean({
        metaTitle:       get('seo title','seotitle','meta title'),
        metaDescription: get('seo description','seodescription','meta description'),
        keywords:        toArr(get('seo keywords','seokeywords','keywords')).length
                           ? toArr(get('seo keywords','seokeywords','keywords')) : undefined,
      }),
    };
  }

  mapCourse(row) {
    const n   = this.normalizeRow(row);
    const get = this.makeGet(n);
    const { toNum, toArr } = this;
    const CATEGORY_ENUMS = ['UG','PG','Diploma','Doctorate','Certificate'];
    const MODE_ENUMS     = ['Full-time','Part-time','Online','Distance'];
    const name = get('course name','name','course');
    if (!name) throw new Error('Missing required field: Course Name');
    return {
      name: String(name).trim(),
      category:      matchEnum(get('level','course level','category','academic level'), CATEGORY_ENUMS),
      discipline:    get('discipline','stream','field','department'),
      duration:      get('duration') ? String(get('duration')) : undefined,
      mode:          matchEnum(get('mode','study mode','course mode'), MODE_ENUMS),
      description:   get('description','overview','about') || '',
      eligibility:   get('eligibility criteria','eligibility','minimum eligibility'),
      admissionType: get('admission type','admissiontype'),
      specializations: toArr(get('specializations','specialization')),
      jobRoles:        toArr(get('job roles','jobroles','career options')),
      skills:          toArr(get('skills','key skills')),
      feeRange: {
        min: toNum(get('minimum fee (inr/year)','min fee','fee min','min fees')),
        max: toNum(get('maximum fee (inr/year)','max fee','fee max','max fees')),
      },
    };
  }

  mapExam(row) {
    const n   = this.normalizeRow(row);
    const get = this.makeGet(n);
    const { toNum, toArr } = this;
    const CATEGORY_ENUMS = ['UG','PG','PhD','Diploma'];
    const LEVEL_ENUMS    = ['National','State','University-Level','Institute-Level'];
    const MODE_ENUMS     = ['Online (CBT)','Offline (OMR)','Online + Offline','Remote Proctored'];
    const FREQ_ENUMS     = ['Annual','Twice a Year','Multiple Times','As per notification'];
    const name = get('exam name','name','exam');
    if (!name) throw new Error('Missing required field: Exam Name');
    return {
      name: String(name).trim(),
      category:          matchEnum(get('category','level','exam level'), CATEGORY_ENUMS),
      conductingBody:    get('conducting body','conductingbody','conducted by','organizer'),
      overview:          get('overview','description','about') || '',
      eligibility:       get('eligibility','eligibility criteria') || '',
      officialWebsite:   get('official website','website','url'),
      examLevel:         matchEnum(get('exam level','examlevel','level type'), LEVEL_ENUMS),
      examMode:          matchEnum(get('exam mode','exammode','mode'), MODE_ENUMS),
      examLanguages:     toArr(get('languages','exam languages')),
      frequency:         matchEnum(get('frequency','exam frequency','conducted'), FREQ_ENUMS),
      registrationFee:   toNum(get('registration fee','reg fee','application fee')),
      totalApplications: toNum(get('total applications','applicants')),
    };
  }

  mapBlog(row) {
    const n   = this.normalizeRow(row);
    const get = this.makeGet(n);
    const title = get('title','blog title','heading');
    if (!title) throw new Error('Missing required field: Title');
    return {
      title:   String(title).trim(),
      content: get('content','body','article') || '',
      excerpt: get('excerpt','summary','description') || '',
      status:  get('status') || 'draft',
      tags:    get('tags') ? String(get('tags')).split(',').map(t => t.trim()).filter(Boolean) : [],
    };
  }
}

module.exports = new ImportExportService();