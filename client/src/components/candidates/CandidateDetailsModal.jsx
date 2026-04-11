import React from 'react';
import { 
  FiX, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, 
  FiFileText, FiAlertTriangle, FiCheckCircle, FiClock 
} from 'react-icons/fi';
import './CandidateDetailsModal.css';

const CandidateDetailsModal = ({ isOpen, onClose, candidate }) => {
  if (!isOpen || !candidate) return null;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return <FiCheckCircle className="status-icon verified" />;
      case 'pending': return <FiClock className="status-icon pending" />;
      case 'unverified': 
      case 'incomplete': return <FiAlertTriangle className="status-icon incomplete" />;
      default: return <FiClock className="status-icon default" />;
    }
  };

  const getStatusLabelClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'status-tag verified';
      case 'pending': return 'status-tag pending';
      case 'unverified':
      case 'incomplete': return 'status-tag incomplete';
      default: return 'status-tag default';
    }
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
        <div className="modal-header-premium">
          <div className="header-identity">
            <div className="candidate-avatar-large">
              {candidate.profilePhoto ? (
                <img src={candidate.profilePhoto} alt={candidate.fullName} />
              ) : (
                <FiUser />
              )}
            </div>
            <div>
              <h2 className="modal-title">{candidate.fullName}</h2>
              <div className="d-flex align-items-center gap-2">
                <span className={getStatusLabelClass(candidate.verificationStatus)}>
                  {getStatusIcon(candidate.verificationStatus)}
                  {candidate.verificationStatus || 'Unverified'}
                </span>
                <span className="dept-badge">
                  <FiBriefcase />
                  {candidate.department || 'Operations'}
                </span>
              </div>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body-premium">
          <div className="detail-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <FiMail className="info-icon" />
                <div>
                  <label>Email Address</label>
                  <p>{candidate.email}</p>
                </div>
              </div>
              <div className="info-item">
                <FiPhone className="info-icon" />
                <div>
                  <label>Phone Number</label>
                  <p>{candidate.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="info-item">
                <FiCalendar className="info-icon" />
                <div>
                  <label>Date Registered</label>
                  <p>{new Date(candidate.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="info-item">
                <FiFileText className="info-icon" />
                <div>
                  <label>Candidate UID</label>
                  <p>{candidate._id.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title">Verification Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <div>
                  <label>Aadhaar Number</label>
                  <p>{candidate.aadhaarNumber || 'Not Provided'}</p>
                </div>
              </div>
              <div className="info-item">
                <div>
                  <label>PAN Number</label>
                  <p>{candidate.panNumber || 'Not Provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {candidate.missingDocuments?.length > 0 && (
            <div className="missing-docs-section">
              <div className="alert-header">
                <FiAlertTriangle />
                <span>Pending Documentation</span>
              </div>
              <div className="missing-docs-list">
                {candidate.missingDocuments.map((doc, idx) => (
                  <span key={idx} className="missing-doc-item">{doc}</span>
                ))}
              </div>
            </div>
          )}

          {candidate.notes && (
            <div className="detail-section mt-4">
              <h3 className="section-title">Administrator Notes</h3>
              <p className="description-text">{candidate.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-footer-premium">
          <button className="btn btn-secondary-custom" onClick={onClose}>Close</button>
          <button className="btn btn-primary-custom" onClick={() => {}}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
