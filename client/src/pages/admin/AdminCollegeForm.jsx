import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCollegeBySlug, useCreateCollege, useUpdateCollege, useUploadCollegeLogo } from '../../hooks/queries';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import styles from './AdminForm.module.css';
import {
  INDIAN_STATES,
  COLLEGE_TYPES,
  FUNDING_TYPES,
  NAAC_GRADES,
  APPROVED_BY_OPTIONS,
  CAMPUS_TYPES,
  ADMISSION_MODES,
} from '../../utils/constants';

const schema = yup.object().shape({
  name: yup.string().required('College name required'),
  shortName: yup.string(),
  logoUrl: yup.string().url('Must be a valid URL').nullable(),
  description: yup.string(),
  establishmentYear: yup.number().min(1800).max(new Date().getFullYear()),
  collegeType: yup.string().oneOf(COLLEGE_TYPES).required(),
  fundingType: yup.string().oneOf(FUNDING_TYPES).required(),
  affiliation: yup.string(),
  accreditation: yup.object({
    naacGrade: yup.string().oneOf(NAAC_GRADES).nullable(),
    nbaStatus: yup.boolean(),
    nirfRank: yup.number().nullable(),
    otherAccreditations: yup.string(), // will be split by comma
  }),
  contact: yup.object({
    phone: yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number').nullable(),
    email: yup.string().email().nullable(),
    website: yup.string().url().nullable(),
    address: yup.string(),
    city: yup.string(),
    state: yup.string().oneOf(INDIAN_STATES),
    pincode: yup.string().matches(/^[0-9]{6}$/, 'Invalid pincode').nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable(),
  }),
  rankings: yup.array().of(
    yup.object({
      year: yup.number().required(),
      category: yup.string(),
      rank: yup.number().required(),
      source: yup.string(),
    })
  ),
  placementStats: yup.object({
    averagePackage: yup.number().nullable(),
    highestPackage: yup.number().nullable(),
    medianPackage: yup.number().nullable(),
    placementPercentage: yup.number().min(0).max(100).nullable(),
    year: yup.number(),
    topRecruiters: yup.string(), // will be split by comma
    sectorWise: yup.object(),
  }),
  fees: yup.object({
    tuitionFee: yup.number().nullable(),
    hostelFee: yup.number().nullable(),
    otherFees: yup.number().nullable(),
    total: yup.number().nullable(),
  }),
  scholarships: yup.array().of(
    yup.object({
      name: yup.string().required(),
      amount: yup.number(),
      eligibility: yup.string(),
      deadline: yup.date().nullable(),
    })
  ),
  approvedBy: yup.string(), // comma separated
  campusInfo: yup.object({
    totalArea: yup.string(),
    campusType: yup.string().oneOf(CAMPUS_TYPES),
    totalStudents: yup.number(),
    totalFaculty: yup.number(),
    studentFacultyRatio: yup.string(),
    departments: yup.number(),
    recognitions: yup.string(), // comma separated
  }),
  hostel: yup.object({
    available: yup.boolean(),
    boysCapacity: yup.number(),
    girlsCapacity: yup.number(),
    annualFee: yup.number(),
    messCharges: yup.number(),
    facilities: yup.string(), // comma separated
    distanceFromCampus: yup.string(),
  }),
  infrastructure: yup.object({
    totalBuildings: yup.number(),
    classroomCount: yup.number(),
    laboratoryCount: yup.number(),
    libraryBooks: yup.number(),
    computerCount: yup.number(),
    sportsGrounds: yup.string(), // comma separated
    auditoriumCapacity: yup.number(),
    cafeteriaCount: yup.number(),
    hasOwnHospital: yup.boolean(),
  }),
  socialMedia: yup.object({
    facebook: yup.string().url().nullable(),
    twitter: yup.string().url().nullable(),
    instagram: yup.string().url().nullable(),
    linkedin: yup.string().url().nullable(),
    youtube: yup.string().url().nullable(),
  }),
  admissionProcess: yup.object({
    mode: yup.string().oneOf(ADMISSION_MODES),
    steps: yup.array().of(
      yup.object({
        stepNumber: yup.number(),
        title: yup.string(),
        description: yup.string(),
      })
    ),
    applicationStartDate: yup.date().nullable(),
    applicationEndDate: yup.date().nullable(),
    applicationFee: yup.number().nullable(),
    applicationLink: yup.string().url().nullable(),
    documentsRequired: yup.string(), // comma separated
  }),
  cutoffs: yup.array().of(
    yup.object({
      course: yup.string().nullable(),
      exam: yup.string().nullable(),
      year: yup.number(),
      category: yup.string().oneOf(['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD']),
      openingRank: yup.number(),
      closingRank: yup.number(),
      cutoffScore: yup.number(),
      round: yup.string(),
    })
  ),
  yearWisePlacements: yup.array().of(
    yup.object({
      year: yup.number(),
      averagePackage: yup.number(),
      highestPackage: yup.number(),
      medianPackage: yup.number(),
      placementPercentage: yup.number(),
      totalStudents: yup.number(),
      placedStudents: yup.number(),
      topRecruiters: yup.string(), // comma separated
    })
  ),
  facilities: yup.string(), // comma separated Facility IDs
  isVerified: yup.boolean(),
  featured: yup.boolean(),
  seo: yup.object({
    metaTitle: yup.string(),
    metaDescription: yup.string(),
    keywords: yup.string(), // comma separated
  }),
});

const AdminCollegeForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = !!slug;
  const { data: collegeData, isLoading: loadingCollege } = useCollegeBySlug(slug, { enabled: isEditing });
  const createMutation = useCreateCollege();
  const updateMutation = useUpdateCollege();
  const { mutate: uploadLogo, isPending: uploadingLogo } = useUploadCollegeLogo();

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      shortName: '',
      logoUrl: '',
      description: '',
      establishmentYear: '',
      collegeType: '',
      fundingType: '',
      affiliation: '',
      accreditation: { naacGrade: '', nbaStatus: false, nirfRank: '', otherAccreditations: '' },
      contact: { phone: '', email: '', website: '', address: '', city: '', state: '', pincode: '', latitude: '', longitude: '' },
      rankings: [],
      placementStats: { averagePackage: '', highestPackage: '', medianPackage: '', placementPercentage: '', year: '', topRecruiters: '', sectorWise: {} },
      fees: { tuitionFee: '', hostelFee: '', otherFees: '', total: '' },
      scholarships: [],
      approvedBy: '',
      campusInfo: { totalArea: '', campusType: '', totalStudents: '', totalFaculty: '', studentFacultyRatio: '', departments: '', recognitions: '' },
      hostel: { available: false, boysCapacity: '', girlsCapacity: '', annualFee: '', messCharges: '', facilities: '', distanceFromCampus: '' },
      infrastructure: { totalBuildings: '', classroomCount: '', laboratoryCount: '', libraryBooks: '', computerCount: '', sportsGrounds: '', auditoriumCapacity: '', cafeteriaCount: '', hasOwnHospital: false },
      socialMedia: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
      admissionProcess: { mode: '', steps: [], applicationStartDate: '', applicationEndDate: '', applicationFee: '', applicationLink: '', documentsRequired: '' },
      cutoffs: [],
      yearWisePlacements: [],
      facilities: '',
      isVerified: false,
      featured: false,
      seo: { metaTitle: '', metaDescription: '', keywords: '' },
    },
  });

  const { fields: rankingFields, append: appendRanking, remove: removeRanking } = useFieldArray({ control, name: 'rankings' });
  const { fields: scholarshipFields, append: appendScholarship, remove: removeScholarship } = useFieldArray({ control, name: 'scholarships' });
  const { fields: cutoffFields, append: appendCutoff, remove: removeCutoff } = useFieldArray({ control, name: 'cutoffs' });
  const { fields: yearPlacementFields, append: appendYearPlacement, remove: removeYearPlacement } = useFieldArray({ control, name: 'yearWisePlacements' });
  const { fields: admissionStepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'admissionProcess.steps' });

  useEffect(() => {
    if (isEditing && collegeData) {
      // Convert arrays and objects to strings for text inputs
      const formatted = {
        ...collegeData,
        approvedBy: collegeData.approvedBy?.join(', ') || '',
        'campusInfo.recognitions': collegeData.campusInfo?.recognitions?.join(', ') || '',
        'hostel.facilities': collegeData.hostel?.facilities?.join(', ') || '',
        'infrastructure.sportsGrounds': collegeData.infrastructure?.sportsGrounds?.join(', ') || '',
        'admissionProcess.documentsRequired': collegeData.admissionProcess?.documentsRequired?.join(', ') || '',
        facilities: collegeData.facilities?.map(f => f._id).join(', ') || '',
        'seo.keywords': collegeData.seo?.keywords?.join(', ') || '',
        'placementStats.topRecruiters': collegeData.placementStats?.topRecruiters?.join(', ') || '',
        'accreditation.otherAccreditations': collegeData.accreditation?.otherAccreditations?.join(', ') || '',
      };
      // Special handling for yearWisePlacements: convert topRecruiters array to string
      if (formatted.yearWisePlacements) {
        formatted.yearWisePlacements = formatted.yearWisePlacements.map(y => ({
          ...y,
          topRecruiters: y.topRecruiters?.join(', ') || '',
        }));
      }
      Object.keys(formatted).forEach(key => {
        setValue(key, formatted[key]);
      });
    }
  }, [isEditing, collegeData, setValue]);

  const transformData = (data) => {
    // Convert string fields to arrays where needed
    const result = { ...data };
    result.approvedBy = data.approvedBy ? data.approvedBy.split(',').map(s => s.trim()) : [];
    result.campusInfo.recognitions = data.campusInfo.recognitions ? data.campusInfo.recognitions.split(',').map(s => s.trim()) : [];
    result.hostel.facilities = data.hostel.facilities ? data.hostel.facilities.split(',').map(s => s.trim()) : [];
    result.infrastructure.sportsGrounds = data.infrastructure.sportsGrounds ? data.infrastructure.sportsGrounds.split(',').map(s => s.trim()) : [];
    result.admissionProcess.documentsRequired = data.admissionProcess.documentsRequired ? data.admissionProcess.documentsRequired.split(',').map(s => s.trim()) : [];
    result.facilities = data.facilities ? data.facilities.split(',').map(s => s.trim()) : [];
    result.seo.keywords = data.seo.keywords ? data.seo.keywords.split(',').map(s => s.trim()) : [];
    result.placementStats.topRecruiters = data.placementStats.topRecruiters ? data.placementStats.topRecruiters.split(',').map(s => s.trim()) : [];
    result.accreditation.otherAccreditations = data.accreditation.otherAccreditations ? data.accreditation.otherAccreditations.split(',').map(s => s.trim()) : [];

    // Convert yearWisePlacements topRecruiters
    if (result.yearWisePlacements) {
      result.yearWisePlacements = result.yearWisePlacements.map(y => ({
        ...y,
        topRecruiters: y.topRecruiters ? y.topRecruiters.split(',').map(s => s.trim()) : [],
      }));
    }

    return result;
  };

  const onSubmit = async (data) => {
    const payload = transformData(data);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: collegeData._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/admin/colleges');
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  if (loadingCollege) return <Loader />;

  return (
    <div className={styles.container}>
      <Link to="/admin/colleges" className={styles.backLink}>← Back to Colleges</Link>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit College' : 'Add New College'}</h1>
        <p>Fill in all details for the college. Fields marked * are required.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Basic Info Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>College Name *</label>
              <input {...register('name')} />
              {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
            </div>
            <div className={styles.field}>
              <label>Short Name (e.g., IITD)</label>
              <input {...register('shortName')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>College Type *</label>
              <select {...register('collegeType')}>
                <option value="">Select discipline</option>
                {COLLEGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.collegeType && <span className={styles.errorMsg}>{errors.collegeType.message}</span>}
            </div>
            <div className={styles.field}>
              <label>Funding Type *</label>
              <select {...register('fundingType')}>
                <option value="">Select ownership</option>
                {FUNDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {/* Logo */}
          <div className={styles.field}>
            <label>College Logo URL</label>
            <input {...register('logoUrl')} placeholder="https://cdn.example.com/logo.png" />
            {errors.logoUrl && <span className={styles.errorMsg}>{errors.logoUrl.message}</span>}
            <small style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Paste a direct image URL, or upload below (available after saving the college)
            </small>
          </div>

          {isEditing && collegeData && (
            <div className={styles.field}>
              <label>Upload Logo Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {collegeData.logoUrl && (
                  <img
                    src={collegeData.logoUrl}
                    alt="Current logo"
                    style={{ width: 64, height: 64, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8, padding: 4, background: '#fff' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file || !collegeData?._id) return;
                    const fd = new FormData();
                    fd.append('logo', file);
                    uploadLogo({ id: collegeData._id, formData: fd, slug });
                    e.target.value = '';
                  }}
                />
                {uploadingLogo && <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Uploading…</span>}
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label>Description</label>
            <textarea {...register('description')} rows="4" />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Established Year</label>
              <input type="number" {...register('establishmentYear')} />
            </div>
            <div className={styles.field}>
              <label>Affiliation</label>
              <input {...register('affiliation')} />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact & Location</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Phone</label>
              <input {...register('contact.phone')} />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" {...register('contact.email')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Website</label>
              <input {...register('contact.website')} />
            </div>
            <div className={styles.field}>
              <label>Address</label>
              <input {...register('contact.address')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>City</label>
              <input {...register('contact.city')} />
            </div>
            <div className={styles.field}>
              <label>State</label>
              <select {...register('contact.state')}>
                <option value="">Select state</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Pincode</label>
              <input {...register('contact.pincode')} />
            </div>
            <div className={styles.field}>
              <label>Coordinates (lat, lng)</label>
              <div className={styles.row} style={{ gap: '0.5rem' }}>
                <input placeholder="Latitude" {...register('contact.latitude')} />
                <input placeholder="Longitude" {...register('contact.longitude')} />
              </div>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Rankings (NIRF, etc.)</h2>
          {rankingFields.map((field, idx) => (
            <div key={field.id} className={styles.row} style={{ marginBottom: '1rem' }}>
              <input placeholder="Year" {...register(`rankings.${idx}.year`)} />
              <input placeholder="Category" {...register(`rankings.${idx}.category`)} />
              <input placeholder="Rank" {...register(`rankings.${idx}.rank`)} />
              <input placeholder="Source" {...register(`rankings.${idx}.source`)} />
              <button type="button" onClick={() => removeRanking(idx)}>✖</button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={() => appendRanking({ year: '', category: '', rank: '', source: '' })}>+ Add Ranking</button>
        </div>

        {/* Accreditation */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Accreditation</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>NAAC Grade</label>
              <select {...register('accreditation.naacGrade')}>
                <option value="">Select</option>
                {NAAC_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>NBA Status</label>
              <input type="checkbox" {...register('accreditation.nbaStatus')} /> Accredited
            </div>
          </div>
          <div className={styles.field}>
            <label>NIRF Rank</label>
            <input type="number" {...register('accreditation.nirfRank')} />
          </div>
          <div className={styles.field}>
            <label>Other Accreditations (comma separated)</label>
            <input {...register('accreditation.otherAccreditations')} placeholder="e.g., AACSB, AMBA" />
          </div>
        </div>

        {/* Fees */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Fees Structure</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Tuition Fee (per year)</label>
              <input type="number" {...register('fees.tuitionFee')} />
            </div>
            <div className={styles.field}>
              <label>Hostel Fee</label>
              <input type="number" {...register('fees.hostelFee')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Other Fees</label>
              <input type="number" {...register('fees.otherFees')} />
            </div>
            <div className={styles.field}>
              <label>Total (approx.)</label>
              <input type="number" {...register('fees.total')} />
            </div>
          </div>
        </div>

        {/* Scholarships */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Scholarships</h2>
          {scholarshipFields.map((field, idx) => (
            <div key={field.id} className={styles.row} style={{ marginBottom: '1rem' }}>
              <input placeholder="Name" {...register(`scholarships.${idx}.name`)} />
              <input placeholder="Amount" {...register(`scholarships.${idx}.amount`)} />
              <input placeholder="Eligibility" {...register(`scholarships.${idx}.eligibility`)} />
              <input type="date" placeholder="Deadline" {...register(`scholarships.${idx}.deadline`)} />
              <button type="button" onClick={() => removeScholarship(idx)}>✖</button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={() => appendScholarship({ name: '', amount: '', eligibility: '', deadline: '' })}>+ Add Scholarship</button>
        </div>

        {/* Approvals */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Regulatory Approvals</h2>
          <div className={styles.field}>
            <label>Approved By (comma separated)</label>
            <input {...register('approvedBy')} placeholder="e.g., UGC, AICTE, NBA" />
          </div>
        </div>

        {/* Campus Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Campus Information</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Total Area (acres)</label>
              <input {...register('campusInfo.totalArea')} />
            </div>
            <div className={styles.field}>
              <label>Campus Type</label>
              <select {...register('campusInfo.campusType')}>
                <option value="">Select</option>
                {CAMPUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Total Students</label>
              <input type="number" {...register('campusInfo.totalStudents')} />
            </div>
            <div className={styles.field}>
              <label>Total Faculty</label>
              <input type="number" {...register('campusInfo.totalFaculty')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Student-Faculty Ratio (e.g., 15:1)</label>
              <input {...register('campusInfo.studentFacultyRatio')} />
            </div>
            <div className={styles.field}>
              <label>Number of Departments</label>
              <input type="number" {...register('campusInfo.departments')} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Recognitions / Awards (comma separated)</label>
            <input {...register('campusInfo.recognitions')} />
          </div>
        </div>

        {/* Hostel */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Hostel Details</h2>
          <div className={styles.checkboxField}>
            <input type="checkbox" {...register('hostel.available')} />
            <label>Hostel Available</label>
          </div>
          {watch('hostel.available') && (
            <>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Boys Capacity</label>
                  <input type="number" {...register('hostel.boysCapacity')} />
                </div>
                <div className={styles.field}>
                  <label>Girls Capacity</label>
                  <input type="number" {...register('hostel.girlsCapacity')} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Annual Fee (₹)</label>
                  <input type="number" {...register('hostel.annualFee')} />
                </div>
                <div className={styles.field}>
                  <label>Mess Charges (₹)</label>
                  <input type="number" {...register('hostel.messCharges')} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Facilities (comma separated)</label>
                <input {...register('hostel.facilities')} placeholder="e.g., Wi-Fi, AC Rooms, Gym" />
              </div>
              <div className={styles.field}>
                <label>Distance from Campus</label>
                <input {...register('hostel.distanceFromCampus')} placeholder="e.g., 500m, 2km" />
              </div>
            </>
          )}
        </div>

        {/* Infrastructure */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Infrastructure</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Total Buildings</label>
              <input type="number" {...register('infrastructure.totalBuildings')} />
            </div>
            <div className={styles.field}>
              <label>Classrooms</label>
              <input type="number" {...register('infrastructure.classroomCount')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Laboratories</label>
              <input type="number" {...register('infrastructure.laboratoryCount')} />
            </div>
            <div className={styles.field}>
              <label>Library Books</label>
              <input type="number" {...register('infrastructure.libraryBooks')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Computers</label>
              <input type="number" {...register('infrastructure.computerCount')} />
            </div>
            <div className={styles.field}>
              <label>Sports Grounds (comma separated)</label>
              <input {...register('infrastructure.sportsGrounds')} placeholder="e.g., Cricket, Football" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Auditorium Capacity</label>
              <input type="number" {...register('infrastructure.auditoriumCapacity')} />
            </div>
            <div className={styles.field}>
              <label>Cafeterias</label>
              <input type="number" {...register('infrastructure.cafeteriaCount')} />
            </div>
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" {...register('infrastructure.hasOwnHospital')} />
            <label>Has Own Hospital</label>
          </div>
        </div>

        {/* Social Media */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Social Media Links</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Facebook</label>
              <input {...register('socialMedia.facebook')} />
            </div>
            <div className={styles.field}>
              <label>Twitter</label>
              <input {...register('socialMedia.twitter')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Instagram</label>
              <input {...register('socialMedia.instagram')} />
            </div>
            <div className={styles.field}>
              <label>LinkedIn</label>
              <input {...register('socialMedia.linkedin')} />
            </div>
          </div>
          <div className={styles.field}>
            <label>YouTube</label>
            <input {...register('socialMedia.youtube')} />
          </div>
        </div>

        {/* Placement Stats */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Placement Statistics</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Average Package (LPA)</label>
              <input type="number" step="0.1" {...register('placementStats.averagePackage')} />
            </div>
            <div className={styles.field}>
              <label>Highest Package (LPA)</label>
              <input type="number" step="0.1" {...register('placementStats.highestPackage')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Median Package (LPA)</label>
              <input type="number" step="0.1" {...register('placementStats.medianPackage')} />
            </div>
            <div className={styles.field}>
              <label>Placement Percentage</label>
              <input type="number" step="0.1" {...register('placementStats.placementPercentage')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Year (of data)</label>
              <input type="number" {...register('placementStats.year')} />
            </div>
            <div className={styles.field}>
              <label>Top Recruiters (comma separated)</label>
              <input {...register('placementStats.topRecruiters')} placeholder="Google, Amazon, etc." />
            </div>
          </div>
        </div>

        {/* Year-wise Placement History */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Year-wise Placement History</h2>
          {yearPlacementFields.map((field, idx) => (
            <div key={field.id} className={styles.card} style={{ marginBottom: '1rem' }}>
              <div className={styles.row}>
                <input placeholder="Year" {...register(`yearWisePlacements.${idx}.year`)} />
                <input placeholder="Avg Package (LPA)" {...register(`yearWisePlacements.${idx}.averagePackage`)} />
                <input placeholder="Highest Package (LPA)" {...register(`yearWisePlacements.${idx}.highestPackage`)} />
                <button type="button" onClick={() => removeYearPlacement(idx)}>✖</button>
              </div>
              <div className={styles.row}>
                <input placeholder="Placement %" {...register(`yearWisePlacements.${idx}.placementPercentage`)} />
                <input placeholder="Total Students" {...register(`yearWisePlacements.${idx}.totalStudents`)} />
                <input placeholder="Placed Students" {...register(`yearWisePlacements.${idx}.placedStudents`)} />
              </div>
              <div className={styles.field}>
                <label>Top Recruiters (comma separated)</label>
                <input {...register(`yearWisePlacements.${idx}.topRecruiters`)} />
              </div>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={() => appendYearPlacement({ year: '', averagePackage: '', highestPackage: '', placementPercentage: '', totalStudents: '', placedStudents: '', topRecruiters: '' })}>+ Add Year</button>
        </div>

        {/* Admission Process */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Admission Process</h2>
          <div className={styles.field}>
            <label>Admission Mode</label>
            <select {...register('admissionProcess.mode')}>
              <option value="">Select</option>
              {ADMISSION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Application Start Date</label>
              <input type="date" {...register('admissionProcess.applicationStartDate')} />
            </div>
            <div className={styles.field}>
              <label>Application End Date</label>
              <input type="date" {...register('admissionProcess.applicationEndDate')} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Application Fee (₹)</label>
              <input type="number" {...register('admissionProcess.applicationFee')} />
            </div>
            <div className={styles.field}>
              <label>Application Link</label>
              <input {...register('admissionProcess.applicationLink')} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Documents Required (comma separated)</label>
            <input {...register('admissionProcess.documentsRequired')} />
          </div>
          <div>
            <label>Admission Steps</label>
            {admissionStepFields.map((field, idx) => (
              <div key={field.id} className={styles.row} style={{ marginBottom: '0.5rem' }}>
                <input placeholder="Title" {...register(`admissionProcess.steps.${idx}.title`)} />
                <input placeholder="Description" {...register(`admissionProcess.steps.${idx}.description`)} />
                <button type="button" onClick={() => removeStep(idx)}>✖</button>
              </div>
            ))}
            <button type="button" className={styles.addBtn} onClick={() => appendStep({ stepNumber: admissionStepFields.length + 1, title: '', description: '' })}>+ Add Step</button>
          </div>
        </div>

        {/* Cutoffs */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Cutoffs (Entrance Exam wise)</h2>
          {cutoffFields.map((field, idx) => (
            <div key={field.id} className={styles.row} style={{ marginBottom: '1rem' }}>
              <input placeholder="Course ID" {...register(`cutoffs.${idx}.course`)} />
              <input placeholder="Exam ID" {...register(`cutoffs.${idx}.exam`)} />
              <input placeholder="Year" {...register(`cutoffs.${idx}.year`)} />
              <select {...register(`cutoffs.${idx}.category`)}>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="PwD">PwD</option>
              </select>
              <input placeholder="Opening Rank" {...register(`cutoffs.${idx}.openingRank`)} />
              <input placeholder="Closing Rank" {...register(`cutoffs.${idx}.closingRank`)} />
              <button type="button" onClick={() => removeCutoff(idx)}>✖</button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={() => appendCutoff({ course: '', exam: '', year: '', category: 'General', openingRank: '', closingRank: '', cutoffScore: '', round: '' })}>+ Add Cutoff</button>
        </div>

        {/* Facilities */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Facilities (IDs)</h2>
          <div className={styles.field}>
            <label>Facility IDs (comma separated)</label>
            <input {...register('facilities')} placeholder="65a1b2c3...,65b2c3d4..." />
          </div>
        </div>

        {/* SEO */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>SEO</h2>
          <div className={styles.field}>
            <label>Meta Title</label>
            <input {...register('seo.metaTitle')} />
          </div>
          <div className={styles.field}>
            <label>Meta Description</label>
            <textarea {...register('seo.metaDescription')} />
          </div>
          <div className={styles.field}>
            <label>Keywords (comma separated)</label>
            <input {...register('seo.keywords')} />
          </div>
        </div>

        {/* Verification & Featured */}
        <div className={styles.section}>
          <div className={styles.checkboxField}>
            <input type="checkbox" {...register('isVerified')} />
            <label>Verified College</label>
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" {...register('featured')} />
            <label>Featured (show on homepage)</label>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" loading={createMutation.isPending || updateMutation.isPending}>
            {isEditing ? 'Update College' : 'Create College'}
          </Button>
          <Link to="/admin/colleges" className={styles.cancelLink}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default AdminCollegeForm;