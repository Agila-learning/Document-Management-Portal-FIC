import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUser, FiCheckCircle, FiMoreHorizontal, 
  FiMail, FiPhone, FiFileText, FiAlertCircle, FiEye, 
  FiUpload, FiTrash2, FiClock, FiCheck, FiSend, FiBriefcase
} from 'react-icons/fi';
import EmptyState from '../common/EmptyState';
import './CandidateGrid.css';

const CandidateCard = ({ candidate, onUpdate, onViewDetails, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Already Doc Collected':
        return {
          className: 'candidate-badge-verified',
          icon: <FiCheckCircle />,
          text: 'Already Doc Collected'
        };
      case 'Submitted':
        return {
          className: 'candidate-badge-submitted',
          icon: <FiCheck />,
          text: 'Submitted'
        };
      case 'Pending Submission':
      default:
        return {
          className: 'candidate-badge-pending',
          icon: <FiClock />,
          text: status || 'Pending'
        };
    }
  };

  const handleAction = (actionType) => {
    setShowMenu(false);
    onAction(actionType, candidate);
  };

  const statusInfo = getStatusBadge(candidate.collectionStatus);
  const docCount = (candidate.submittedDocumentsList?.length || 0) + (candidate.documents?.length || 0);

  const formattedSubmittedDate = candidate.submittedDate 
    ? new Date(candidate.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date(candidate.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formattedCollectedDate = candidate.collectedDate 
    ? new Date(candidate.collectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="candidate-card h-100">
      {/* Card Header */}
      <div className="card-profile-header">
        <div className="d-flex align-items-center gap-3">
          <div className="candidate-avatar">
            {candidate.profilePhoto ? (
              <img src={candidate.profilePhoto} alt={candidate.fullName} className="img-fluid" />
            ) : (
              <FiUser />
            )}
          </div>
          <div>
            <h3 className="candidate-name text-truncate" style={{ maxWidth: '160px' }} title={candidate.fullName}>
              {candidate.fullName}
            </h3>
            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <span className={`status-pill ${statusInfo.className}`}>
                {statusInfo.text}
              </span>
              <span className="dept-tag" title="Process">
                <FiBriefcase className="me-1" />
                {candidate.processName || 'General Process'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="menu-container" ref={menuRef}>
          <button 
            className={`btn-action-trigger ${showMenu ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="More Actions"
          >
            <FiMoreHorizontal />
          </button>
          
          {showMenu && (
            <div className="action-dropdown shadow-lg">
              <button onClick={() => handleAction('view')}>
                <FiEye /> View Full Details
              </button>
              
              {candidate.collectionStatus !== 'Already Doc Collected' ? (
                <button onClick={() => handleAction('mark-collected')} className="text-success fw-bold">
                  <FiCheckCircle /> Mark as Doc Collected
                </button>
              ) : (
                <button onClick={() => handleAction('mark-submitted')} className="text-primary">
                  <FiClock /> Mark as Submitted
                </button>
              )}

              <button onClick={() => handleAction('send-ack')} className="text-info">
                <FiSend /> Send Acknowledgement Mail
              </button>

              <button onClick={() => handleAction('upload')}>
                <FiUpload /> Upload Document
              </button>
              
              <div className="dropdown-divider"></div>
              <button onClick={() => handleAction('delete')} className="text-danger">
                <FiTrash2 /> Delete Candidate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-profile-body">
        {/* Contact info: Phone & Email */}
        <div className="candidate-contact-list mb-3">
          <div className="contact-item">
            <FiPhone className="contact-icon text-primary" />
            <span className="fw-bold">{candidate.phone || 'No Phone Registered'}</span>
          </div>
          <div className="contact-item">
            <FiMail className="contact-icon text-secondary" />
            <span className="text-truncate" title={candidate.email}>{candidate.email || 'No Email Registered'}</span>
          </div>
        </div>

        {/* Process, HR & Audit Tracking Box */}
        <div className="p-2 rounded-3 bg-light border mb-2" style={{ fontSize: '0.8125rem' }}>
          <div className="d-flex justify-content-between py-1 border-bottom">
            <span className="text-secondary">Assigned HR:</span>
            <span className="fw-semibold text-dark">{candidate.hrName || 'HR Operations'}</span>
          </div>
          <div className="d-flex justify-content-between py-1 border-bottom">
            <span className="text-secondary">Submitted Date:</span>
            <span className="fw-semibold text-dark">{formattedSubmittedDate}</span>
          </div>
          {candidate.collectionStatus === 'Already Doc Collected' && (
            <div className="d-flex justify-content-between py-1 text-success">
              <span className="fw-semibold">Collected Date:</span>
              <span className="fw-bold">{formattedCollectedDate || 'Recorded'}</span>
            </div>
          )}
          <div className="d-flex justify-content-between py-1">
            <span className="text-secondary">Submitted Docs:</span>
            <span className="badge bg-secondary-subtle text-secondary-emphasis fw-bold">
              {docCount} Documents
            </span>
          </div>
        </div>

        {/* Missing Documents Alert */}
        {candidate.missingDocuments?.length > 0 && (
          <div className="missing-doc-panel">
            <div className="panel-header">
              <FiAlertCircle />
              <span>Missing Documents</span>
            </div>
            <div className="panel-docs">
              {candidate.missingDocuments.slice(0, 2).join(', ')}
              {candidate.missingDocuments.length > 2 && ` +${candidate.missingDocuments.length - 2} more`}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="card-profile-footer">
        <div className="uid-label">
          UID: {candidate._id.slice(-8).toUpperCase()}
        </div>
        <button 
          className="btn-profile-view"
          onClick={() => onViewDetails(candidate)}
        >
          <span>View Audit & Docs</span>
        </button>
      </div>
    </div>
  );
};

const CandidateGrid = ({ candidates, onUpdate, onViewDetails, onAction }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="w-100 p-5">
        <EmptyState 
          icon={<FiUser />} 
          title="No Results Found" 
          message="No candidate matches the given name, mobile number, or filter status."
        />
      </div>
    );
  }

  return (
    <div className="row g-4 mb-4">
      {candidates.map((candidate) => (
        <div className="col-12 col-md-6 col-xxl-4" key={candidate._id}>
          <CandidateCard 
            candidate={candidate} 
            onUpdate={onUpdate} 
            onViewDetails={onViewDetails}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
};

export default CandidateGrid;
