import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { collegeService } from '../../services/collegeService';
import styles from './AdminForm.module.css';

const COLLEGE_TYPES = [
  'Engineering & Technology', 'Medical & Health Sciences',
  'Management & Business', 'Law', 'Arts & Science',
  'Architecture & Planning', 'Pharmacy', 'Agriculture',
  'Education & Teaching', 'Design & Fine Arts',
  'Commerce & Finance', 'Technical', 'Multi-Disciplinary',
];

const FUNDING_TYPES = [
  'Government', 'Private', 'Semi-Government',
  'Public-Private Partnership', 'Deemed University',
  'Private University', 'Central University', 'State University',
  'Autonomous', 'Minority Institution',
];

const CreateCollege = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    collegeType: '',
    fundingType: '',
    establishmentYear: '',
    affiliation: '',
    description: '',
    // contact
    city: '',
    state: '',
    country: 'India',
    address: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    // accreditation
    nirfRank: '',
    naacGrade: '',
    nbaStatus: false,
    // fees
    tuitionFee: '',
    hostelFee: '',
    otherFees: '',
    // placementStats
    placementPercentage: '',
    averagePackage: '',
    highestPackage: '',
    medianPackage: '',
    // flags
    featured: false,
    // Campus & Hostel
    campusTotalArea: '',
    campusType: '',
    totalStudents: '',
    totalFaculty: '',
    studentFacultyRatio: '',
    hostelAvailable: false,
    hostelBoysCapacity: '',
    hostelGirlsCapacity: '',
    hostelAnnualFee: '',
    hostelMessCharges: '',
    // Admission
    admissionMode: '',
    applicationFee: '',
    applicationLink: '',
    applicationStartDate: '',
    applicationEndDate: '',
    documentsRequired: '',  // comma-separated string
    // Approvals
    approvedBy: '',  // comma-separated string e.g. "UGC,AICTE"
    // Social Media
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => collegeService.createCollege(data),
    onSuccess: () => navigate('/dashboard/admin'),
    onError: (err) => setError(err?.response?.data?.message || 'Failed to create college'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      shortName: form.shortName || undefined,
      collegeType: form.collegeType || undefined,
      fundingType: form.fundingType || undefined,
      establishmentYear: form.establishmentYear ? Number(form.establishmentYear) : undefined,
      affiliation: form.affiliation || undefined,
      description: form.description,
      contact: {
        city: form.city,
        state: form.state,
        country: form.country || 'India',
        address: form.address || undefined,
        pincode: form.pincode || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
      },
      accreditation: {
        nirfRank: form.nirfRank ? Number(form.nirfRank) : undefined,
        naacGrade: form.naacGrade || undefined,
        nbaStatus: form.nbaStatus,
      },
      fees: {
        tuitionFee: form.tuitionFee ? Number(form.tuitionFee) : undefined,
        hostelFee: form.hostelFee ? Number(form.hostelFee) : undefined,
        otherFees: form.otherFees ? Number(form.otherFees) : undefined,
        total: (form.tuitionFee || form.hostelFee || form.otherFees)
          ? (Number(form.tuitionFee) || 0) + (Number(form.hostelFee) || 0) + (Number(form.otherFees) || 0)
          : undefined,
      },
      placementStats: {
        placementPercentage: form.placementPercentage ? Number(form.placementPercentage) : undefined,
        averagePackage: form.averagePackage ? Number(form.averagePackage) : undefined,
        highestPackage: form.highestPackage ? Number(form.highestPackage) : undefined,
        medianPackage: form.medianPackage ? Number(form.medianPackage) : undefined,
        year: new Date().getFullYear(),
      },
      featured: form.featured,
      approvedBy: form.approvedBy ? form.approvedBy.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      campusInfo: {
        totalArea: form.campusTotalArea || undefined,
        campusType: form.campusType || undefined,
        totalStudents: form.totalStudents ? Number(form.totalStudents) : undefined,
        totalFaculty: form.totalFaculty ? Number(form.totalFaculty) : undefined,
        studentFacultyRatio: form.studentFacultyRatio || undefined,
      },
      hostel: form.hostelAvailable ? {
        available: true,
        boysCapacity: form.hostelBoysCapacity ? Number(form.hostelBoysCapacity) : undefined,
        girlsCapacity: form.hostelGirlsCapacity ? Number(form.hostelGirlsCapacity) : undefined,
        annualFee: form.hostelAnnualFee ? Number(form.hostelAnnualFee) : undefined,
        messCharges: form.hostelMessCharges ? Number(form.hostelMessCharges) : undefined,
      } : { available: false },
      admissionProcess: {
        mode: form.admissionMode || undefined,
        applicationFee: form.applicationFee ? Number(form.applicationFee) : undefined,
        applicationLink: form.applicationLink || undefined,
        applicationStartDate: form.applicationStartDate || undefined,
        applicationEndDate: form.applicationEndDate || undefined,
        documentsRequired: form.documentsRequired ? form.documentsRequired.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      },
      socialMedia: {
        facebook: form.facebook || undefined,
        instagram: form.instagram || undefined,
        linkedin: form.linkedin || undefined,
        youtube: form.youtube || undefined,
      },
    };
    mutation.mutate(payload);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Add New College</h1>
        <p>Fill in the details to add a college to the platform</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        {/* Basic Info */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Basic Information</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>College Name <span>*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Indian Institute of Technology Delhi" />
            </div>
            <div className={styles.field}>
              <label>Short Name</label>
              <input name="shortName" value={form.shortName} onChange={handleChange} placeholder="e.g. IIT Delhi" />
            </div>
          </div>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>Discipline / Stream</label>
              <select name="collegeType" value={form.collegeType} onChange={handleChange}>
                <option value="">Select discipline</option>
                {COLLEGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Institute Type</label>
              <select name="fundingType" value={form.fundingType} onChange={handleChange}>
                <option value="">Select institute type</option>
                {FUNDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Established Year</label>
              <input name="establishmentYear" type="number" value={form.establishmentYear} onChange={handleChange} placeholder="e.g. 1961" min="1700" max={new Date().getFullYear()} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Affiliation</label>
            <input name="affiliation" value={form.affiliation} onChange={handleChange} placeholder="e.g. Autonomous / University of Delhi" />
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief overview of the college..." rows={4} />
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} />
            <label htmlFor="featured">Mark as Featured College</label>
          </div>
        </div>

        {/* Contact */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Contact Information</div>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="New Delhi" />
            </div>
            <div className={styles.field}>
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="Delhi" />
            </div>
            <div className={styles.field}>
              <label>Country</label>
              <input name="country" value={form.country} onChange={handleChange} placeholder="India" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Hauz Khas, New Delhi" />
            </div>
            <div className={styles.field}>
              <label>Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="110016" />
            </div>
          </div>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91-11-26597135" />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="info@iitd.ac.in" />
            </div>
            <div className={styles.field}>
              <label>Website</label>
              <input name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://home.iitd.ac.in" />
            </div>
          </div>
        </div>

        {/* Accreditation */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Rankings & Accreditation</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>NIRF Rank</label>
              <input name="nirfRank" type="number" value={form.nirfRank} onChange={handleChange} placeholder="e.g. 2" min="1" />
            </div>
            <div className={styles.field}>
              <label>NAAC Grade</label>
              <input name="naacGrade" value={form.naacGrade} onChange={handleChange} placeholder="e.g. A++" />
            </div>
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" id="nbaStatus" name="nbaStatus" checked={form.nbaStatus} onChange={handleChange} />
            <label htmlFor="nbaStatus">NBA Accredited</label>
          </div>
        </div>

        {/* Fees */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Fee Structure</div>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>Tuition Fee (₹/year)</label>
              <input name="tuitionFee" type="number" value={form.tuitionFee} onChange={handleChange} placeholder="e.g. 200000" min="0" />
            </div>
            <div className={styles.field}>
              <label>Hostel Fee (₹/year)</label>
              <input name="hostelFee" type="number" value={form.hostelFee} onChange={handleChange} placeholder="e.g. 80000" min="0" />
            </div>
            <div className={styles.field}>
              <label>Other Fees (₹/year)</label>
              <input name="otherFees" type="number" value={form.otherFees} onChange={handleChange} placeholder="e.g. 20000" min="0" />
            </div>
          </div>
        </div>

        {/* Placements */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Placement Statistics</div>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>Placement %</label>
              <input name="placementPercentage" type="number" value={form.placementPercentage} onChange={handleChange} placeholder="e.g. 95" min="0" max="100" />
            </div>
            <div className={styles.field}>
              <label>Average Package (₹ LPA)</label>
              <input name="averagePackage" type="number" value={form.averagePackage} onChange={handleChange} placeholder="e.g. 1800000" min="0" />
            </div>
            <div className={styles.field}>
              <label>Highest Package (₹ LPA)</label>
              <input name="highestPackage" type="number" value={form.highestPackage} onChange={handleChange} placeholder="e.g. 8000000" min="0" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Median Package (₹ LPA)</label>
              <input name="medianPackage" type="number" value={form.medianPackage} onChange={handleChange} placeholder="e.g. 1200000" min="0" />
            </div>
          </div>
        </div>

        {/* Approved By */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Regulatory Approvals</div>
          <div className={styles.field}>
            <label>Approved By (comma-separated)</label>
            <input name="approvedBy" value={form.approvedBy} onChange={handleChange} placeholder="e.g. UGC, AICTE, NBA" />
          </div>
        </div>

        {/* Campus & Hostel */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Campus & Hostel</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Campus Total Area</label>
              <input name="campusTotalArea" value={form.campusTotalArea} onChange={handleChange} placeholder="e.g. 300 acres" />
            </div>
            <div className={styles.field}>
              <label>Campus Type</label>
              <select name="campusType" value={form.campusType} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Urban">Urban</option>
                <option value="Semi-Urban">Semi-Urban</option>
                <option value="Rural">Rural</option>
                <option value="Suburban">Suburban</option>
              </select>
            </div>
          </div>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>Total Students</label>
              <input name="totalStudents" type="number" value={form.totalStudents} onChange={handleChange} placeholder="e.g. 5000" min="0" />
            </div>
            <div className={styles.field}>
              <label>Total Faculty</label>
              <input name="totalFaculty" type="number" value={form.totalFaculty} onChange={handleChange} placeholder="e.g. 350" min="0" />
            </div>
            <div className={styles.field}>
              <label>Student:Faculty Ratio</label>
              <input name="studentFacultyRatio" value={form.studentFacultyRatio} onChange={handleChange} placeholder="e.g. 15:1" />
            </div>
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" id="hostelAvailable" name="hostelAvailable" checked={form.hostelAvailable} onChange={handleChange} />
            <label htmlFor="hostelAvailable">Hostel Available</label>
          </div>
          {form.hostelAvailable && (
            <>
              <div className={styles.row3}>
                <div className={styles.field}>
                  <label>Boys Hostel Capacity</label>
                  <input name="hostelBoysCapacity" type="number" value={form.hostelBoysCapacity} onChange={handleChange} placeholder="e.g. 500" min="0" />
                </div>
                <div className={styles.field}>
                  <label>Girls Hostel Capacity</label>
                  <input name="hostelGirlsCapacity" type="number" value={form.hostelGirlsCapacity} onChange={handleChange} placeholder="e.g. 300" min="0" />
                </div>
                <div className={styles.field}>
                  <label>Annual Hostel Fee (₹)</label>
                  <input name="hostelAnnualFee" type="number" value={form.hostelAnnualFee} onChange={handleChange} placeholder="e.g. 50000" min="0" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Annual Mess Charges (₹)</label>
                  <input name="hostelMessCharges" type="number" value={form.hostelMessCharges} onChange={handleChange} placeholder="e.g. 36000" min="0" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Admission Process */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Admission Process</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Admission Mode</label>
              <select name="admissionMode" value={form.admissionMode} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Merit-Based">Merit-Based</option>
                <option value="Entrance-Based">Entrance-Based</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Application Fee (₹)</label>
              <input name="applicationFee" type="number" value={form.applicationFee} onChange={handleChange} placeholder="e.g. 1000" min="0" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Application Start Date</label>
              <input name="applicationStartDate" type="date" value={form.applicationStartDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Application End Date</label>
              <input name="applicationEndDate" type="date" value={form.applicationEndDate} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Application Link</label>
            <input name="applicationLink" type="url" value={form.applicationLink} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className={styles.field}>
            <label>Documents Required (comma-separated)</label>
            <input name="documentsRequired" value={form.documentsRequired} onChange={handleChange} placeholder="e.g. Class 10 Marksheet, Aadhar Card, Passport Photo" />
          </div>
        </div>

        {/* Social Media */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Social Media</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Facebook</label>
              <input name="facebook" type="url" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
            </div>
            <div className={styles.field}>
              <label>Instagram</label>
              <input name="instagram" type="url" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>LinkedIn</label>
              <input name="linkedin" type="url" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/school/..." />
            </div>
            <div className={styles.field}>
              <label>YouTube</label>
              <input name="youtube" type="url" value={form.youtube} onChange={handleChange} placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create College'}
          </button>
          <Link to="/dashboard/admin" className={styles.cancelLink}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateCollege;
