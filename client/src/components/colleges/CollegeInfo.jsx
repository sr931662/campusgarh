import React from 'react';
import styles from './CollegeInfo.module.css';
import { formatDate } from '../../utils/formatters';
import { FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const CollegeInfo = ({ college }) => {
  const contact = college.contact || {};
  const social = college.socialMedia || {};
  const accreditation = college.accreditation || {};

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>About {college.name}</h2>
      <div className={styles.description}>
        <p>{college.description || 'No description available.'}</p>
        {college.establishmentYear && <p><strong>Established:</strong> {college.establishmentYear}</p>}
        {college.affiliation && <p><strong>Affiliation:</strong> {college.affiliation}</p>}
      </div>

      <div className={styles.grid}>
        <div className={styles.infoCard}>
          <h3>Contact Details</h3>
          {contact.phone && <p><FaPhone /> {contact.phone}</p>}
          {contact.email && <p><FaEnvelope /> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
          {contact.website && <p><FaGlobe /> <a href={contact.website} target="_blank" rel="noopener noreferrer">{contact.website}</a></p>}
          {contact.address && <p><FaMapMarkerAlt /> {contact.address}, {contact.city}, {contact.state} - {contact.pincode}</p>}
        </div>

        <div className={styles.infoCard}>
          <h3>Accreditation & Rankings</h3>
          {accreditation.naacGrade && <p><strong>NAAC Grade:</strong> {accreditation.naacGrade}</p>}
          {accreditation.nbaStatus && <p><strong>NBA Accredited</strong></p>}
          {accreditation.nirfRank && <p><strong>NIRF Rank:</strong> {accreditation.nirfRank}</p>}
          {accreditation.otherAccreditations?.length > 0 && (
            <p><strong>Other:</strong> {accreditation.otherAccreditations.join(', ')}</p>
          )}
        </div>
      </div>

      {college.rankings?.length > 0 && (
        <div className={styles.rankings}>
          <h3>Rankings</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.rankTable}>
              <thead>
                <tr><th>Year</th><th>Category</th><th>Rank</th><th>Source</th></tr>
              </thead>
              <tbody>
                {college.rankings.map((r, i) => (
                  <tr key={i}><td>{r.year}</td><td>{r.category}</td><td>{r.rank}</td><td>{r.source}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(social.facebook || social.twitter || social.instagram || social.linkedin || social.youtube) && (
        <div className={styles.socialLinks}>
          <h3>Follow us</h3>
          <div className={styles.socialIcons}>
            {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook /></a>}
            {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>}
            {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>}
            {social.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer"><FaYoutube /></a>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeInfo;