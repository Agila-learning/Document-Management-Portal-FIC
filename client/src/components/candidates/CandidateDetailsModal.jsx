import React, { useState, useEffect } from 'react';
import { 
  FiX, FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, 
  FiFileText, FiAlertTriangle, FiCheckCircle, FiClock,
  FiSend, FiCheck, FiDownload, FiExternalLink, FiUpload,
  FiEdit2, FiSave, FiPlus, FiTrash2, FiLayers
} from 'react-icons/fi';
import api, { BASE_URL } from '../../utils/api';
import './CandidateDetailsModal.css';

const STANDARD_DOCUMENT_OPTIONS = [
  '10th Marksheet',
  '11th Marksheet',
  '12th Marksheet',
  'UG Certificate',
  'PG Certificate',
  'Consolidated Marksheet',
  'Semester Marksheet',
  'Aadhar Card',
  'PAN Card',
  'Resume / CV',
  'Relieving / Experience Letter',
  'Last 3 Months Payslips',
  'Passport Size Photo',
  'Bank Passbook / Cancelled Cheque'
];

const SEMESTER_OPTIONS = [
  'Semester 1 Marksheet',
  'Semester 2 Marksheet',
  'Semester 3 Marksheet',
  'Semester 4 Marksheet',
  'Semester 5 Marksheet',
  'Semester 6 Marksheet',
  'Semester 7 Marksheet',
  'Semester 8 Marksheet',
  'General Semester Marksheet'
];

const DEFAULT_PROGRAM_OPTIONS = [
  'Customer Operations',
  'Voice Process',
  'Non-Voice / BPO',
  'Tech Support',
  'HR & Recruitment',
  'IT & Software Services',
  'Finance & Accounts',
  'Sales & Business Development',
  'Operations & Logistics'
];

const CandidateDetailsModal = ({ isOpen, onClose, candidate, onUpdate, onUploadDoc }) => {
  if (!isOpen || !candidate) return null;

  const [currentCandidate, setCurrentCandidate] = useState(candidate);
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    processName: candidate.processName || '',
    hrName: candidate.hrName || '',
    fullName: candidate.fullName || '',
    phone: candidate.phone || '',
    email: candidate.email || '',
    notes: candidate.notes || ''
  });

  // Document add in modal
  const [docDropdownVal, setDocDropdownVal] = useState('10th Marksheet');
  const [selectedSemester, setSelectedSemester] = useState('Semester 1 Marksheet');
  const [customDocName, setCustomDocName] = useState('');
  const [editableDocs, setEditableDocs] = useState([]);

  useEffect(() => {
    setCurrentCandidate(candidate);
    setEditForm({
      processName: candidate.processName || '',
      hrName: candidate.hrName || '',
      fullName: candidate.fullName || '',
      phone: candidate.phone || '',
      email: candidate.email || '',
      notes: candidate.notes || ''
    });
    setEditableDocs(candidate.submittedDocumentsList || []);
    setIsEditing(false);
    setActionMessage(null);
  }, [candidate, isOpen]);

  const isCollected = currentCandidate.collectionStatus === 'Already Doc Collected';

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleCollection = async () => {
    setUpdating(true);
    setActionMessage(null);
    try {
      const nextStatus = isCollected ? 'Submitted' : 'Already Doc Collected';
      const { data } = await api.patch(`/candidates/${currentCandidate._id}/collection-status`, {
        collectionStatus: nextStatus,
        collectedDate: nextStatus === 'Already Doc Collected' ? new Date() : null
      });
      setCurrentCandidate(data.candidate);
      setActionMessage({ type: 'success', text: `Status successfully updated to: ${nextStatus}` });
      onUpdate && onUpdate();
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update collection status' });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendAckEmail = async () => {
    if (!currentCandidate.email) {
      alert('This candidate has no registered email address.');
      return;
    }
    setUpdating(true);
    setActionMessage(null);
    try {
      const { data } = await api.post(`/candidates/${currentCandidate._id}/send-ack`);
      setActionMessage({ type: 'success', text: data.message || 'Acknowledgement email sent successfully!' });
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to send email' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadDoc = (doc) => {
    try {
      let url = doc.filePath;
      if (!url) return;
      if (!url.startsWith('http')) {
        const normalized = doc.filePath.replace(/\\/g, '/');
        const afterUploads = normalized.split('uploads/').slice(1).join('uploads/');
        url = `${BASE_URL}/uploads/${encodeURI(afterUploads)}`;
      }
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open document:', e);
    }
  };

  // Add document from dropdown inside details modal
  const handleAddDocToCandidate = () => {
    let nameToAdd = docDropdownVal;
    if (docDropdownVal === 'Semester Marksheet') {
      nameToAdd = selectedSemester;
    }

    if (!nameToAdd) return;

    if (editableDocs.some(d => d.name === nameToAdd)) {
      setActionMessage({ type: 'warning', text: `"${nameToAdd}" is already in the document list.` });
      return;
    }

    const newDoc = {
      name: nameToAdd,
      documentType: nameToAdd.includes('Marksheet') || nameToAdd.includes('Certificate') ? 'Educational' : 'Identity/Official',
      submittedAt: new Date(),
      status: isCollected ? 'Collected' : 'Submitted'
    };

    setEditableDocs([...editableDocs, newDoc]);
    setActionMessage({ type: 'info', text: `Added "${nameToAdd}". Click "Save Changes" to record.` });
  };

  // Add custom doc
  const handleAddCustomDoc = (e) => {
    e?.preventDefault();
    const trimmed = customDocName.trim();
    if (!trimmed) return;
    if (editableDocs.some(d => d.name === trimmed)) {
      setActionMessage({ type: 'warning', text: `"${trimmed}" is already in the list.` });
      return;
    }

    const newDoc = {
      name: trimmed,
      documentType: 'Custom Document',
      submittedAt: new Date(),
      status: isCollected ? 'Collected' : 'Submitted'
    };

    setEditableDocs([...editableDocs, newDoc]);
    setCustomDocName('');
  };

  // Remove doc from editable list
  const handleRemoveDocItem = (index) => {
    setEditableDocs(editableDocs.filter((_, idx) => idx !== index));
  };

  // Save updated candidate information (Program Name, HR Name, and Documents)
  const handleSaveEdit = async () => {
    setUpdating(true);
    setActionMessage(null);
    try {
      const payload = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        email: editForm.email,
        processName: editForm.processName,
        hrName: editForm.hrName,
        notes: editForm.notes,
        submittedDocumentsList: editableDocs
      };

      const { data } = await api.put(`/candidates/${currentCandidate._id}`, payload);
      setCurrentCandidate(data);
      setIsEditing(false);
      setActionMessage({ type: 'success', text: 'Candidate details & documents updated successfully!' });
      onUpdate && onUpdate();
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update candidate details' });
    } finally {
      setUpdating(false);
    }
  };

  // Combine submittedDocumentsList and documents array for normal view
  const allSubmittedDocs = [];
  const seenNames = new Set();

  if (currentCandidate.submittedDocumentsList && currentCandidate.submittedDocumentsList.length > 0) {
    currentCandidate.submittedDocumentsList.forEach(item => {
      seenNames.add(item.name.toLowerCase());
      allSubmittedDocs.push({
        name: item.name,
        type: item.documentType || 'Candidate Document',
        date: item.submittedAt || currentCandidate.submittedDate,
        status: item.status || (isCollected ? 'Collected' : 'Submitted'),
        documentId: item.documentId
      });
    });
  }

  if (currentCandidate.documents && currentCandidate.documents.length > 0) {
    currentCandidate.documents.forEach(doc => {
      if (!seenNames.has((doc.title || '').toLowerCase())) {
        allSubmittedDocs.push({
          name: doc.title,
          type: doc.category || 'Uploaded File',
          date: doc.createdAt,
          status: isCollected ? 'Collected' : 'Submitted',
          filePath: doc.filePath,
          isUploaded: true
        });
      }
    });
  }

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-content-premium shadow-2xl" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '880px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="modal-header-premium flex-shrink-0">
          <div className="header-identity">
            <div className="candidate-avatar-large">
              {currentCandidate.profilePhoto ? (
                <img src={currentCandidate.profilePhoto} alt={currentCandidate.fullName} />
              ) : (
                <FiUser />
              )}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h2 className="modal-title mb-0">{currentCandidate.fullName}</h2>
                <button
                  type="button"
                  className={`btn btn-sm ${isEditing ? 'btn-outline-danger' : 'btn-outline-primary'} py-0 px-2 ms-2`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <FiEdit2 className="me-1" />
                  {isEditing ? 'Cancel Edit' : 'Edit Details'}
                </button>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                <span className={`badge ${isCollected ? 'bg-success' : 'bg-primary'} px-3 py-1 rounded-pill`} style={{ fontSize: '0.8125rem' }}>
                  {isCollected ? '✓ Already Doc Collected' : '● Submitted'}
                </span>
                <span className="dept-badge fw-bold text-primary">
                  <FiBriefcase className="me-1" />
                  {currentCandidate.processName || 'General Process'}
                </span>
                <span className="text-secondary small">
                  UID: {currentCandidate._id.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body-premium" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {actionMessage && (
            <div className={`alert alert-${actionMessage.type} py-2 px-3 mb-4 rounded-3 d-flex align-items-center justify-content-between`}>
              <span>{actionMessage.text}</span>
              <button type="button" className="btn-close" onClick={() => setActionMessage(null)}></button>
            </div>
          )}

          {/* ================= EDIT MODE ================= */}
          {isEditing ? (
            <div className="bg-light p-3 rounded-3 border mb-4">
              <h4 className="h6 text-primary fw-bold mb-3 d-flex align-items-center gap-2">
                <FiEdit2 /> Edit Program Name, HR Name & Candidate Info
              </h4>

              <div className="row g-3">
                {/* Program / Process Name Edit */}
                <div className="col-12 col-md-6">
                  <label className="fw-bold small mb-1">
                    <FiBriefcase className="me-1 text-primary" />
                    Program / Process Name:
                  </label>
                  <select
                    className="form-control-custom w-100 mb-1 form-control-sm"
                    value={DEFAULT_PROGRAM_OPTIONS.includes(editForm.processName) ? editForm.processName : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        setEditForm({ ...editForm, processName: e.target.value });
                      }
                    }}
                  >
                    <option value="">-- Choose Program Preset --</option>
                    {DEFAULT_PROGRAM_OPTIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="__custom__">Custom Program Name</option>
                  </select>
                  <input
                    type="text"
                    value={editForm.processName}
                    onChange={(e) => setEditForm({ ...editForm, processName: e.target.value })}
                    placeholder="Enter Program / Process Name"
                    className="form-control-custom w-100"
                  />
                </div>

                {/* HR Name Edit */}
                <div className="col-12 col-md-6">
                  <label className="fw-bold small mb-1">
                    <FiUser className="me-1 text-primary" />
                    Handling HR Name:
                  </label>
                  <input
                    type="text"
                    value={editForm.hrName}
                    onChange={(e) => setEditForm({ ...editForm, hrName: e.target.value })}
                    placeholder="Enter HR Representative Name"
                    className="form-control-custom w-100 mt-md-4"
                  />
                </div>

                {/* Candidate Name */}
                <div className="col-12 col-md-4">
                  <label className="fw-bold small mb-1">Candidate Full Name:</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="form-control-custom w-100"
                  />
                </div>

                {/* Mobile Phone */}
                <div className="col-12 col-md-4">
                  <label className="fw-bold small mb-1">Mobile Number:</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="form-control-custom w-100"
                  />
                </div>

                {/* Email */}
                <div className="col-12 col-md-4">
                  <label className="fw-bold small mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="form-control-custom w-100"
                  />
                </div>
              </div>

              {/* Document Selection in Edit Mode */}
              <div className="mt-4 pt-3 border-top">
                <label className="fw-bold small text-dark d-block mb-2">
                  <FiLayers className="me-1 text-primary" />
                  Add Documents to Candidate ({editableDocs.length} currently listed)
                </label>
                <div className="row g-2 align-items-center mb-3">
                  <div className="col-12 col-md-5">
                    <select
                      className="form-control-custom w-100"
                      value={docDropdownVal}
                      onChange={(e) => setDocDropdownVal(e.target.value)}
                    >
                      <option value="10th Marksheet">10th Marksheet</option>
                      <option value="11th Marksheet">11th Marksheet</option>
                      <option value="12th Marksheet">12th Marksheet</option>
                      <option value="UG Certificate">UG Certificate</option>
                      <option value="PG Certificate">PG Certificate</option>
                      <option value="Consolidated Marksheet">Consolidated Marksheet</option>
                      <option value="Semester Marksheet">Semester Marksheet (Select sem)</option>
                      <option value="Aadhar Card">Aadhar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Resume / CV">Resume / CV</option>
                      <option value="Relieving / Experience Letter">Relieving / Experience Letter</option>
                      <option value="Last 3 Months Payslips">Last 3 Months Payslips</option>
                      <option value="Passport Size Photo">Passport Size Photo</option>
                      <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cancelled Cheque</option>
                    </select>
                  </div>

                  {docDropdownVal === 'Semester Marksheet' && (
                    <div className="col-12 col-md-4">
                      <select
                        className="form-control-custom w-100"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                      >
                        {SEMESTER_OPTIONS.map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-12 col-md-3">
                    <button
                      type="button"
                      className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={handleAddDocToCandidate}
                    >
                      <FiPlus /> Add Document
                    </button>
                  </div>
                </div>

                {/* Custom Doc input */}
                <div className="d-flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    placeholder="Or type custom document name..."
                    className="form-control-custom form-control-sm flex-grow-1"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={handleAddCustomDoc}
                  >
                    + Add Custom
                  </button>
                </div>

                {/* Editable Docs list */}
                <div className="border rounded-2 p-2 bg-white" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  <div className="d-flex flex-wrap gap-2">
                    {editableDocs.map((doc, idx) => (
                      <div key={idx} className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2 rounded-2">
                        <FiFileText className="text-primary" />
                        <span>{doc.name}</span>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-danger ms-1"
                          onClick={() => handleRemoveDocItem(idx)}
                          title="Remove"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Edit Button */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary-custom d-flex align-items-center gap-2"
                  onClick={handleSaveEdit}
                  disabled={updating}
                >
                  <FiSave />
                  <span>{updating ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= NORMAL VIEW ================= */
            <>
              {/* Detailed Audit & Tracking Section */}
              <div className="detail-section bg-light p-3 rounded-3 border mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h3 className="section-title text-primary d-flex align-items-center gap-2 mb-0">
                    <FiClock /> Document Submission & Collection Audit
                  </h3>
                  <button 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit2 /> Edit Program / HR
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="info-item">
                      <FiCalendar className="info-icon text-primary" />
                      <div>
                        <label>Submission Date</label>
                        <p className="fw-bold text-dark">{formatDateTime(currentCandidate.submittedDate || currentCandidate.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="info-item">
                      <FiBriefcase className="info-icon text-primary" />
                      <div>
                        <label>Program / Process Name</label>
                        <p className="fw-bold text-primary">{currentCandidate.processName || 'General Process'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="info-item">
                      <FiUser className="info-icon text-secondary" />
                      <div>
                        <label>Assigned / Handling HR</label>
                        <p className="fw-bold text-dark">{currentCandidate.hrName || 'HR Operations'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="info-item">
                      <FiCheckCircle className={`info-icon ${isCollected ? 'text-success' : 'text-secondary'}`} />
                      <div>
                        <label>Collection Status</label>
                        <p className={`fw-bold ${isCollected ? 'text-success' : 'text-primary'}`}>
                          {currentCandidate.collectionStatus || 'Submitted'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* If Already Doc Collected, show collected details */}
                  {isCollected && (
                    <>
                      <div className="col-12 col-md-6">
                        <div className="info-item border border-success-subtle bg-success-subtle p-2 rounded-2">
                          <FiCheckCircle className="info-icon text-success" />
                          <div>
                            <label className="text-success-emphasis">Collected Date</label>
                            <p className="fw-bold text-success mb-0">{formatDateTime(currentCandidate.collectedDate)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="info-item border border-success-subtle bg-success-subtle p-2 rounded-2">
                          <FiUser className="info-icon text-success" />
                          <div>
                            <label className="text-success-emphasis">Collected By (HR)</label>
                            <p className="fw-bold text-success mb-0">{currentCandidate.collectedBy || currentCandidate.hrName || 'HR Representative'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="detail-section mb-4">
                <h3 className="section-title">Candidate Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <FiPhone className="info-icon text-success" />
                    <div>
                      <label>Mobile Number (For Search)</label>
                      <p className="fw-bold text-dark">{currentCandidate.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiMail className="info-icon text-primary" />
                    <div>
                      <label>Email Address</label>
                      <p>{currentCandidate.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiFileText className="info-icon" />
                    <div>
                      <label>Aadhaar Number</label>
                      <p>{currentCandidate.aadhaarNumber || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiFileText className="info-icon" />
                    <div>
                      <label>PAN Number</label>
                      <p>{currentCandidate.panNumber || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitted Documents Detailed Checklist & Files */}
              <div className="detail-section mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h3 className="section-title mb-0">
                    📄 Submitted Documents List ({allSubmittedDocs.length})
                  </h3>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <FiPlus /> Manage / Add Doc Types
                    </button>
                    {onUploadDoc && (
                      <button 
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => onUploadDoc(currentCandidate)}
                      >
                        <FiUpload /> Upload File
                      </button>
                    )}
                  </div>
                </div>

                {allSubmittedDocs.length > 0 ? (
                  <div className="table-responsive border rounded-3">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40%' }}>Document Name</th>
                          <th>Category / Type</th>
                          <th>Date Submitted</th>
                          <th>Status</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSubmittedDocs.map((doc, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold text-dark">
                              <FiFileText className="text-primary me-2" />
                              {doc.name}
                            </td>
                            <td className="text-secondary">{doc.type}</td>
                            <td className="text-secondary">{formatDateTime(doc.date)}</td>
                            <td>
                              <span className={`badge ${isCollected ? 'bg-success' : 'bg-primary-subtle text-primary'}`}>
                                {isCollected ? 'Collected' : 'Submitted'}
                              </span>
                            </td>
                            <td className="text-end">
                              {doc.filePath ? (
                                <button 
                                  className="btn btn-sm btn-light border py-1 px-2"
                                  onClick={() => handleDownloadDoc(doc)}
                                  title="View / Download"
                                >
                                  <FiExternalLink /> View
                                </button>
                              ) : (
                                <span className="text-muted small">Logged</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded text-center text-muted">
                    No documents logged yet for this candidate.
                  </div>
                )}
              </div>

              {/* Missing Documents Alert */}
              {currentCandidate.missingDocuments?.length > 0 && (
                <div className="missing-docs-section mb-4">
                  <div className="alert-header">
                    <FiAlertTriangle />
                    <span>Pending Documentation</span>
                  </div>
                  <div className="missing-docs-list">
                    {currentCandidate.missingDocuments.map((doc, idx) => (
                      <span key={idx} className="missing-doc-item">{doc}</span>
                    ))}
                  </div>
                </div>
              )}

              {currentCandidate.notes && (
                <div className="detail-section">
                  <h3 className="section-title">Internal Notes</h3>
                  <p className="description-text">{currentCandidate.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="modal-footer-premium flex-shrink-0 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem 2rem' }}>
          <div className="d-flex gap-2">
            <button 
              className={`btn ${isCollected ? 'btn-outline-primary' : 'btn-success'} d-flex align-items-center gap-2`}
              onClick={handleToggleCollection}
              disabled={updating}
            >
              {isCollected ? <FiClock /> : <FiCheckCircle />}
              <span>{isCollected ? 'Revert to Submitted' : 'Mark as Doc Collected'}</span>
            </button>

            {currentCandidate.email && (
              <button 
                className="btn btn-outline-info d-flex align-items-center gap-2"
                onClick={handleSendAckEmail}
                disabled={updating}
                title="Send Document Submission Acknowledgement Email"
              >
                <FiSend />
                <span>Resend Acknowledgement Mail</span>
              </button>
            )}
          </div>

          <button className="btn btn-secondary-custom" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
