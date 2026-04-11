import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUser, FiCheckCircle, FiXCircle, FiMoreHorizontal, 
  FiMail, FiPhone, FiFileText, FiAlertCircle, FiEye, 
  FiEdit3, FiUpload, FiTrash2, FiClock
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

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'candidate-badge-verified';
      case 'pending': return 'candidate-badge-pending';
      case 'incomplete': 
      case 'unverified': return 'candidate-badge-incomplete';
      default: return 'candidate-badge-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return <FiCheckCircle />;
      case 'pending': return <FiClock />;
      default: return <FiAlertCircle />;
    }
  };

  const handleAction = (actionType) => {
    setShowMenu(false);
    onAction(actionType, candidate);
  };

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
            <h3 className="candidate-name text-truncate" style={{ maxWidth: '150px' }}>
              {candidate.fullName}
            </h3>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className={`status-pill ${getStatusBadgeClass(candidate.verificationStatus)}`}>
                {candidate.verificationStatus || 'Unverified'}
              </span>
              <span className="dept-tag">{candidate.department || 'Operations'}</span>
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
                <FiEye /> View Profile
              </button>
              <button onClick={() => handleAction('edit')}>
                <FiEdit3 /> Edit Candidate
              </button>
              <button onClick={() => handleAction('upload')}>
                <FiUpload /> Upload Documents
              </button>
              <button onClick={() => handleAction('verify')}>
                <FiCheckCircle /> Verify Documents
              </button>
              <div className="dropdown-divider"></div>
              <button onClick={() => handleAction('incomplete')} className="text-warning">
                <FiClock /> Mark Incomplete
              </button>
              <button onClick={() => handleAction('delete')} className="text-danger">
                <FiTrash2 /> Delete Candidate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-profile-body">
        <div className="candidate-contact-list">
          <div className="contact-item">
            <FiMail className="contact-icon" />
            <span className="text-truncate">{candidate.email}</span>
          </div>
          <div className="contact-item">
            <FiPhone className="contact-icon" />
            <span>{candidate.phone || 'No Phone Registered'}</span>
          </div>
        </div>

        {/* Status Alert for Incomplete Documents */}
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
          <span>View Details</span>
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
          title="No Results" 
          message="No candidates matching your filter criteria were found."
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
