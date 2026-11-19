import React, { useState } from 'react';
import { 
  FiUser, FiPhone, FiMail, FiCalendar, FiBriefcase, 
  FiCheckCircle, FiClock, FiFileText, FiEye, FiCheck, 
  FiSend, FiUpload, FiTrash2, FiLayers, FiAlertCircle 
} from 'react-icons/fi';
import './DocumentTrackingTable.css';

const DocumentTrackingTable = ({ 
  candidates = [], 
  onViewDetails, 
  onAction,
  onUploadDoc 
}) => {
  const [expandedDocsCandidateId, setExpandedDocsCandidateId] = useState(null);

  // Format Date and Time cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // KPI Calculations
  const totalCount = candidates.length;
  const collectedCount = candidates.filter(c => c.collectionStatus === 'Already Doc Collected').length;
  const submittedCount = candidates.filter(c => c.collectionStatus === 'Submitted').length;
  const pendingCount = candidates.filter(c => c.collectionStatus === 'Pending Submission').length;

  return (
    <div className="doc-tracking-section">
      {/* 4 Professional KPI Metric Cards */}
      <div className="kpi-row">
        <div className="kpi-stat-card">
          <div className="kpi-icon-box kpi-icon-total">
            <FiUser />
          </div>
          <div className="kpi-stat-info">
            <div className="kpi-label">Total Candidates</div>
            <div className="kpi-value">{totalCount}</div>
          </div>
        </div>

        <div className="kpi-stat-card">
          <div className="kpi-icon-box kpi-icon-submitted">
            <FiClock />
          </div>
          <div className="kpi-stat-info">
            <div className="kpi-label">Docs Submitted (Awaiting Collection)</div>
            <div className="kpi-value text-primary">{submittedCount}</div>
          </div>
        </div>

        <div className="kpi-stat-card">
          <div className="kpi-icon-box kpi-icon-collected">
            <FiCheckCircle />
          </div>
          <div className="kpi-stat-info">
            <div className="kpi-label">Already Doc Collected</div>
            <div className="kpi-value text-success">{collectedCount}</div>
          </div>
        </div>

        <div className="kpi-stat-card">
          <div className="kpi-icon-box kpi-icon-pending">
            <FiAlertCircle />
          </div>
          <div className="kpi-stat-info">
            <div className="kpi-label">Pending Submission</div>
            <div className="kpi-value text-secondary">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Main Document Tracking & Audit Table Card */}
      <div className="doc-tracking-card">
        <div className="p-3 bg-white border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h3 className="h6 fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <FiLayers className="text-primary" />
              Document Status, Collection Dates & Audit Trail
            </h3>
            <small className="text-muted">
              Live tracking of submitted marksheets, collection status, HR handlers, and audit timestamps
            </small>
          </div>
          <span className="badge bg-light text-secondary border px-3 py-2 fw-semibold">
            Showing {candidates.length} Record{candidates.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="table-tracking-wrapper">
          <table className="tracking-table">
            <thead>
              <tr>
                <th style={{ minWidth: '200px' }}>Candidate Profile</th>
                <th style={{ minWidth: '140px' }}>Mobile & Contact</th>
                <th style={{ minWidth: '140px' }}>Program / Process</th>
                <th style={{ minWidth: '120px' }}>Handling HR</th>
                <th style={{ minWidth: '130px' }}>Submission Date</th>
                <th style={{ minWidth: '160px' }}>Collection Status</th>
                <th style={{ minWidth: '160px' }}>Collection Date & By</th>
                <th style={{ minWidth: '220px' }}>Documents Submitted</th>
                <th style={{ minWidth: '170px' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((cand) => {
                const isCollected = cand.collectionStatus === 'Already Doc Collected';
                const docItems = cand.submittedDocumentsList || [];
                const isExpanded = expandedDocsCandidateId === cand._id;
                const visibleDocs = isExpanded ? docItems : docItems.slice(0, 3);

                return (
                  <tr key={cand._id}>
                    {/* 1. Candidate Info */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="cand-avatar-sm">
                          {cand.profilePhoto ? (
                            <img src={cand.profilePhoto} alt={cand.fullName} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            cand.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="cand-name-title text-truncate" style={{ maxWidth: '180px' }} title={cand.fullName}>
                            {cand.fullName}
                          </div>
                          <span className="cand-uid-pill mt-1 d-inline-block">
                            UID: {cand._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Mobile & Email */}
                    <td>
                      <div>
                        <div className="fw-bold text-dark d-flex align-items-center gap-1">
                          <FiPhone className="text-primary small" />
                          <span>{cand.phone || 'No Mobile'}</span>
                        </div>
                        {cand.email && (
                          <div className="text-secondary small text-truncate" style={{ maxWidth: '160px' }} title={cand.email}>
                            <FiMail className="me-1 small" />
                            {cand.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 3. Program / Process Name */}
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-bold">
                        <FiBriefcase className="me-1" />
                        {cand.processName || 'General'}
                      </span>
                    </td>

                    {/* 4. Handling HR */}
                    <td>
                      <div className="d-flex align-items-center gap-1 text-dark fw-semibold small">
                        <FiUser className="text-secondary" />
                        <span>{cand.hrName || 'HR Operations'}</span>
                      </div>
                    </td>

                    {/* 5. Submitted Date */}
                    <td>
                      <div className="small fw-semibold text-dark">
                        <FiCalendar className="text-muted me-1" />
                        {formatDate(cand.submittedDate || cand.createdAt)}
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {formatDateTime(cand.submittedDate || cand.createdAt).split(',')[1]}
                      </small>
                    </td>

                    {/* 6. Document Collection Status Badge */}
                    <td>
                      {isCollected ? (
                        <span className="badge-status-collected">
                          <FiCheckCircle />
                          Already Doc Collected
                        </span>
                      ) : cand.collectionStatus === 'Submitted' ? (
                        <span className="badge-status-submitted">
                          <FiClock />
                          Submitted
                        </span>
                      ) : (
                        <span className="badge-status-pending">
                          <FiAlertCircle />
                          Pending Submission
                        </span>
                      )}
                    </td>

                    {/* 7. Collection Date & Collected By (Detailed Tracking) */}
                    <td>
                      {isCollected ? (
                        <div>
                          <div className="fw-bold text-success small d-flex align-items-center gap-1">
                            <FiCheck className="text-success" />
                            <span>{formatDate(cand.collectedDate)}</span>
                          </div>
                          <small className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>
                            By: {cand.collectedBy || cand.hrName || 'HR'}
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">
                          Awaiting physical collection
                        </span>
                      )}
                    </td>

                    {/* 8. Submitted Documents List (Checklist Tags) */}
                    <td>
                      <div className="d-flex flex-wrap gap-1 align-items-center" style={{ maxWidth: '280px' }}>
                        {visibleDocs.length > 0 ? (
                          <>
                            {visibleDocs.map((doc, idx) => (
                              <span 
                                key={idx} 
                                className={`doc-pill-tag ${doc.name?.includes('Marksheet') || doc.name?.includes('Certificate') ? 'academic' : 'identity'}`}
                                title={`${doc.name} (${doc.status || 'Submitted'})`}
                              >
                                <FiFileText className="small" />
                                {doc.name}
                              </span>
                            ))}
                            {docItems.length > 3 && (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-primary small fw-bold text-decoration-none"
                                style={{ fontSize: '0.72rem' }}
                                onClick={() => setExpandedDocsCandidateId(isExpanded ? null : cand._id)}
                              >
                                {isExpanded ? 'Show Less' : `+${docItems.length - 3} more`}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-muted small">No documents logged</span>
                        )}
                      </div>
                    </td>

                    {/* 9. Actions Column */}
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1">
                        {/* 1-Click Mark Collected / Revert */}
                        {!isCollected ? (
                          <button
                            type="button"
                            className="btn-action-collect"
                            onClick={() => onAction('mark-collected', cand)}
                            title="Mark documents as collected"
                          >
                            <FiCheckCircle /> Collect
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-revert"
                            onClick={() => onAction('mark-submitted', cand)}
                            title="Revert status to Submitted"
                          >
                            <FiClock /> Revert
                          </button>
                        )}

                        {/* View Audit Details */}
                        <button
                          type="button"
                          className="btn-action-view"
                          onClick={() => onViewDetails(cand)}
                          title="View Full Audit & Documents"
                        >
                          <FiEye /> View
                        </button>

                        {/* Resend Email Ack */}
                        {cand.email && (
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => onAction('send-ack', cand)}
                            title="Send / Resend Acknowledgement Email"
                          >
                            <FiSend />
                          </button>
                        )}

                        {/* Upload Doc */}
                        {onUploadDoc && (
                          <button
                            type="button"
                            className="btn-action-icon text-primary"
                            onClick={() => onUploadDoc(cand)}
                            title="Upload Document File"
                          >
                            <FiUpload />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentTrackingTable;
