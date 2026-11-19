import React, { useState, useEffect } from 'react';
import { 
  FiX, FiUser, FiCheck, FiLoader, FiMail, FiCalendar, 
  FiPlus, FiFileText, FiBriefcase, FiLayers, FiPhone, FiAlertCircle 
} from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './RegisterCandidateModal.css';

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

const RegisterCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    processName: 'Customer Operations',
    hrName: '',
    submittedDate: getTodayString(),
    collectionStatus: 'Submitted',
    collectedDate: getTodayString(),
    collectedBy: '',
    aadhaarNumber: '',
    panNumber: '',
    educationalQualification: '',
    experienceDetails: '',
    notes: '',
  });

  const [programList, setProgramList] = useState(DEFAULT_PROGRAM_OPTIONS);
  const [hrList, setHrList] = useState([]);
  const [isCustomProgram, setIsCustomProgram] = useState(false);
  const [isCustomHr, setIsCustomHr] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Document selection states
  const [selectedDocs, setSelectedDocs] = useState([
    '10th Marksheet',
    '12th Marksheet',
    'UG Certificate',
    'Aadhar Card',
    'PAN Card'
  ]);
  const [docDropdownVal, setDocDropdownVal] = useState('10th Marksheet');
  const [selectedSemester, setSelectedSemester] = useState('Semester 1 Marksheet');
  const [customDocInput, setCustomDocInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await api.get('/candidates/metadata/options');
        if (data.programs?.length) setProgramList(data.programs);
        if (data.hrList?.length) setHrList(data.hrList);
      } catch (e) {
        console.error('Failed to load metadata options:', e);
      }
    };
    if (isOpen) {
      fetchMetadata();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && !formData.hrName) {
      const defaultHr = user.name || user.username || 'HR Operations';
      setFormData(prev => ({
        ...prev,
        hrName: defaultHr,
        collectedBy: defaultHr
      }));
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // 10-digit mobile number validation handler
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: digitsOnly }));
    setError('');

    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError(`Mobile number must be exactly 10 digits (${digitsOnly.length}/10)`);
    } else {
      setPhoneError('');
    }
  };

  const handleProgramSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomProgram(true);
      setFormData(prev => ({ ...prev, processName: '' }));
    } else {
      setIsCustomProgram(false);
      setFormData(prev => ({ ...prev, processName: val }));
    }
  };

  const handleHrSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomHr(true);
      setFormData(prev => ({ ...prev, hrName: '', collectedBy: '' }));
    } else {
      setIsCustomHr(false);
      setFormData(prev => ({ ...prev, hrName: val, collectedBy: val }));
    }
  };

  const handleAddFromDropdown = () => {
    let docToAdd = docDropdownVal;
    if (docDropdownVal === 'Semester Marksheet') {
      docToAdd = selectedSemester;
    }

    if (!docToAdd) return;

    if (selectedDocs.includes(docToAdd)) {
      setError(`"${docToAdd}" is already in the document list.`);
      return;
    }

    setSelectedDocs([...selectedDocs, docToAdd]);
    setError('');
  };

  const handleAddCustomDoc = (e) => {
    e?.preventDefault();
    const trimmed = customDocInput.trim();
    if (!trimmed) return;
    if (selectedDocs.includes(trimmed)) {
      setError(`"${trimmed}" is already in the document list.`);
      return;
    }
    setSelectedDocs([...selectedDocs, trimmed]);
    setCustomDocInput('');
    setError('');
  };

  const handleRemoveDoc = (docToRemove) => {
    setSelectedDocs(selectedDocs.filter(d => d !== docToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Candidate Full Name is required.');
      return;
    }

    // Strict 10-digit validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setPhoneError('Must be exactly 10 digits');
      return;
    }

    if (!formData.processName || !formData.processName.trim()) {
      setError('Please select or enter a Program / Process Name.');
      return;
    }

    if (!formData.hrName || !formData.hrName.trim()) {
      setError('Please select or enter a Handling HR Name.');
      return;
    }

    setSaving(true);
    try {
      const submittedDocumentsList = selectedDocs.map(docName => ({
        name: docName,
        documentType: docName.includes('Marksheet') || docName.includes('Certificate') ? 'Educational' : 'Identity/Official',
        submittedAt: new Date(formData.submittedDate || Date.now()),
        status: formData.collectionStatus === 'Already Doc Collected' ? 'Collected' : 'Submitted'
      }));

      const missingDocuments = STANDARD_DOCUMENT_OPTIONS.filter(d => 
        d !== 'Semester Marksheet' && !selectedDocs.includes(d) && !selectedDocs.some(sd => sd.includes(d))
      );

      const payload = {
        ...formData,
        phone: cleanPhone,
        processName: formData.processName.trim(),
        hrName: formData.hrName.trim(),
        submittedDocumentsList,
        missingDocuments,
        collectedDate: formData.collectionStatus === 'Already Doc Collected' ? formData.collectedDate : null,
        collectedBy: formData.collectionStatus === 'Already Doc Collected' ? (formData.collectedBy || formData.hrName) : null
      };

      // Completely omit optional Aadhaar and PAN if empty to prevent MongoDB duplicate key E11000 errors!
      if (!payload.aadhaarNumber || payload.aadhaarNumber.trim() === '') {
        delete payload.aadhaarNumber;
      } else {
        payload.aadhaarNumber = payload.aadhaarNumber.trim();
      }

      if (!payload.panNumber || payload.panNumber.trim() === '') {
        delete payload.panNumber;
      } else {
        payload.panNumber = payload.panNumber.trim().toUpperCase();
      }

      await api.post('/candidates', payload);
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      const backendMsg = err.response?.data?.message || '';
      if (backendMsg.includes('E11000') && backendMsg.includes('aadhaar')) {
        setError('This Aadhaar number is already registered with another candidate.');
      } else if (backendMsg.includes('E11000') && backendMsg.includes('pan')) {
        setError('This PAN number is already registered with another candidate.');
      } else {
        setError(backendMsg || 'Candidate registration failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      processName: 'Customer Operations',
      hrName: user?.name || user?.username || 'HR Operations',
      submittedDate: getTodayString(),
      collectionStatus: 'Submitted',
      collectedDate: getTodayString(),
      collectedBy: user?.name || user?.username || 'HR Operations',
      aadhaarNumber: '',
      panNumber: '',
      educationalQualification: '',
      experienceDetails: '',
      notes: '',
    });
    setSelectedDocs([
      '10th Marksheet',
      '12th Marksheet',
      'UG Certificate',
      'Aadhar Card',
      'PAN Card'
    ]);
    setIsCustomProgram(false);
    setIsCustomHr(false);
    setPhoneError('');
    setCustomDocInput('');
    setSuccess(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-custom-overlay d-flex align-items-center justify-content-center" onClick={onClose}>
      <div 
        className="modal-custom-content rc-modal-content animate-scaleIn shadow-2xl" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '840px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="modal-custom-header d-flex align-items-center justify-content-between flex-shrink-0">
          <div>
            <h2 className="modal-title-custom">Register Candidate & Document Submission</h2>
            <div className="modal-subtitle-custom">Assign Program, Handling HR & track submitted documents</div>
          </div>
          <button className="btn-close-modal-custom" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {success ? (
          <div className="upload-success-state text-center py-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
            <div className="success-icon-box mx-auto mb-4">
              <FiCheck />
            </div>
            <h3 className="h4 font-extrabold text-navy">Candidate Registered & Docs Logged!</h3>
            <p className="text-secondary font-medium">
              Profile created successfully. An automated acknowledgement email has been dispatched to the candidate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-custom-body p-4" style={{ flex: 1, overflowY: 'auto' }}>
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-2">
                  <FiAlertCircle />
                  {error}
                </span>
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {/* Notification Banner */}
            <div className="alert alert-primary d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3" style={{ fontSize: '0.85rem' }}>
              <FiMail className="flex-shrink-0" />
              <span>An automated submission email with the candidate's document checklist will be dispatched upon registration.</span>
            </div>

            <div className="row g-3">
              {/* Full Name */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label className="fw-bold small mb-1">Candidate Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="E.g. Rahul Kumar Singh"
                    className="form-control-custom w-100"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number with 10-digit validation */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="fw-bold small m-0">Mobile Number <span className="text-danger">*</span></label>
                    <span 
                      className={`badge ${formData.phone.length === 10 ? 'bg-success' : 'bg-light text-muted border'}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {formData.phone.length}/10 digits
                    </span>
                  </div>
                  <div className="position-relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Enter 10-digit mobile number"
                      className={`form-control-custom w-100 ${phoneError ? 'border-danger' : ''}`}
                      maxLength={10}
                      required
                    />
                  </div>
                  {phoneError ? (
                    <small className="text-danger d-block mt-1" style={{ fontSize: '0.75rem' }}>{phoneError}</small>
                  ) : (
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>Used for candidate search and verification</small>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label className="fw-bold small mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="candidate@email.com (Receives ack email)"
                    className="form-control-custom w-100"
                  />
                </div>
              </div>

              {/* Submission Date */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label className="fw-bold small mb-1">Submission Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="submittedDate"
                    value={formData.submittedDate}
                    onChange={handleChange}
                    className="form-control-custom w-100"
                    required
                  />
                </div>
              </div>

              {/* ----------------- CLEAN UNIFIED PROGRAM NAME (NO DUPLICATION) ----------------- */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="fw-bold small m-0 d-flex align-items-center gap-1">
                      <FiBriefcase className="text-primary" />
                      <span>Program / Process Name</span>
                      <span className="text-danger">*</span>
                    </label>
                    {isCustomProgram && (
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary small text-decoration-none"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => {
                          setIsCustomProgram(false);
                          setFormData(prev => ({ ...prev, processName: programList[0] || 'Customer Operations' }));
                        }}
                      >
                        ← Choose from presets
                      </button>
                    )}
                  </div>

                  {isCustomProgram ? (
                    <input
                      type="text"
                      name="processName"
                      value={formData.processName}
                      onChange={handleChange}
                      placeholder="Type custom program name (e.g. Inbound Voice, QA)..."
                      className="form-control-custom w-100"
                      required
                      autoFocus
                    />
                  ) : (
                    <select
                      className="form-control-custom w-100"
                      value={formData.processName}
                      onChange={handleProgramSelect}
                      required
                    >
                      <option value="" disabled>-- Select Program / Process --</option>
                      {programList.map(prog => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                      <option value="__custom__">✎ + Enter Custom Program Name...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* ----------------- CLEAN UNIFIED HR NAME (NO DUPLICATION) ----------------- */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="fw-bold small m-0 d-flex align-items-center gap-1">
                      <FiUser className="text-primary" />
                      <span>Handling HR Name</span>
                      <span className="text-danger">*</span>
                    </label>
                    {isCustomHr && (
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary small text-decoration-none"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => {
                          setIsCustomHr(false);
                          const def = user?.name || user?.username || hrList[0] || 'HR Operations';
                          setFormData(prev => ({ ...prev, hrName: def, collectedBy: def }));
                        }}
                      >
                        ← Choose from presets
                      </button>
                    )}
                  </div>

                  {isCustomHr ? (
                    <input
                      type="text"
                      name="hrName"
                      value={formData.hrName}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          hrName: e.target.value,
                          collectedBy: prev.collectionStatus === 'Already Doc Collected' ? e.target.value : prev.collectedBy
                        }));
                      }}
                      placeholder="Type HR Representative name..."
                      className="form-control-custom w-100"
                      required
                      autoFocus
                    />
                  ) : (
                    <select
                      className="form-control-custom w-100"
                      value={formData.hrName}
                      onChange={handleHrSelect}
                      required
                    >
                      <option value="" disabled>-- Select HR Representative --</option>
                      {hrList.map(hr => (
                        <option key={hr} value={hr}>{hr}</option>
                      ))}
                      {user?.name && !hrList.includes(user.name) && (
                        <option value={user.name}>{user.name} (Current User)</option>
                      )}
                      {user?.username && !hrList.includes(user.username) && (
                        <option value={user.username}>{user.username} (Current User)</option>
                      )}
                      <option value="__custom__">✎ + Enter Custom HR Name...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Document Collection Status */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label className="fw-bold small mb-1">Document Collection Status</label>
                  <select
                    name="collectionStatus"
                    value={formData.collectionStatus}
                    onChange={handleChange}
                    className="form-control-custom w-100"
                  >
                    <option value="Submitted">Submitted (Documents Received)</option>
                    <option value="Already Doc Collected">Already Doc Collected (Physical/Originals Collected)</option>
                    <option value="Pending Submission">Pending Submission</option>
                  </select>
                </div>
              </div>

              {/* If Already Doc Collected, show collected date */}
              {formData.collectionStatus === 'Already Doc Collected' && (
                <div className="col-12 col-md-6">
                  <div className="form-group-custom">
                    <label className="fw-bold small mb-1">Collection Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      name="collectedDate"
                      value={formData.collectedDate}
                      onChange={handleChange}
                      className="form-control-custom w-100"
                      required
                    />
                  </div>
                </div>
              )}

              {/* ----------------- DOCUMENT SELECTION SECTION ----------------- */}
              <div className="col-12 mt-3">
                <div className="card border p-3 rounded-3 bg-light shadow-sm">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                      <FiLayers className="text-primary" />
                      <span>Select Documents Submitted</span>
                    </label>
                    <span className="badge bg-primary px-3 py-1">
                      {selectedDocs.length} Selected
                    </span>
                  </div>
                  <p className="text-secondary small mb-3">
                    Choose standard documents from the dropdown (10th, 12th, Consolidated, Aadhar, PAN, PG, UG, Semester Marksheets) or enter custom.
                  </p>

                  {/* Dropdown Selection Row */}
                  <div className="row g-2 align-items-center mb-3">
                    <div className="col-12 col-md-5">
                      <select
                        className="form-control-custom w-100"
                        value={docDropdownVal}
                        onChange={(e) => setDocDropdownVal(e.target.value)}
                      >
                        <optgroup label="Academic Certificates & Marksheets">
                          <option value="10th Marksheet">10th Marksheet</option>
                          <option value="11th Marksheet">11th Marksheet</option>
                          <option value="12th Marksheet">12th Marksheet</option>
                          <option value="UG Certificate">UG Certificate</option>
                          <option value="PG Certificate">PG Certificate</option>
                          <option value="Consolidated Marksheet">Consolidated Marksheet</option>
                          <option value="Semester Marksheet">Semester Marksheet (Pick semester)</option>
                        </optgroup>
                        <optgroup label="Identity & Official Records">
                          <option value="Aadhar Card">Aadhar Card</option>
                          <option value="PAN Card">PAN Card</option>
                          <option value="Resume / CV">Resume / CV</option>
                          <option value="Relieving / Experience Letter">Relieving / Experience Letter</option>
                          <option value="Last 3 Months Payslips">Last 3 Months Payslips</option>
                          <option value="Passport Size Photo">Passport Size Photo</option>
                          <option value="Bank Passbook / Cancelled Cheque">Bank Passbook / Cancelled Cheque</option>
                        </optgroup>
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

                    <div className={`col-12 ${docDropdownVal === 'Semester Marksheet' ? 'col-md-3' : 'col-md-7'}`}>
                      <button
                        type="button"
                        className="btn btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-1"
                        onClick={handleAddFromDropdown}
                      >
                        <FiPlus /> Add Document
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Pills */}
                  <div className="d-flex flex-wrap gap-1 mb-3 align-items-center">
                    <span className="small text-secondary me-2 fw-semibold">Quick Add:</span>
                    {[
                      '10th Marksheet',
                      '12th Marksheet',
                      'Consolidated Marksheet',
                      'Aadhar Card',
                      'PAN Card',
                      'UG Certificate',
                      'PG Certificate'
                    ].map(doc => (
                      <button
                        key={doc}
                        type="button"
                        className={`btn btn-sm py-1 px-2 ${selectedDocs.includes(doc) ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.74rem' }}
                        onClick={() => {
                          if (selectedDocs.includes(doc)) {
                            handleRemoveDoc(doc);
                          } else {
                            setSelectedDocs([...selectedDocs, doc]);
                          }
                        }}
                      >
                        {selectedDocs.includes(doc) ? `✓ ${doc}` : `+ ${doc}`}
                      </button>
                    ))}
                  </div>

                  {/* Custom Document Input */}
                  <div className="d-flex gap-2 mb-3">
                    <input
                      type="text"
                      value={customDocInput}
                      onChange={(e) => setCustomDocInput(e.target.value)}
                      placeholder="Add any other document (e.g. Migration Certificate, Course Diploma)..."
                      className="form-control-custom form-control-sm flex-grow-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomDoc();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3"
                      onClick={handleAddCustomDoc}
                    >
                      + Add
                    </button>
                  </div>

                  {/* Active Selected Documents List */}
                  <div className="border rounded-2 p-2 bg-white" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {selectedDocs.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {selectedDocs.map((doc, idx) => (
                          <div 
                            key={idx} 
                            className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2 rounded-2"
                            style={{ fontSize: '0.8rem' }}
                          >
                            <FiFileText className="text-primary" />
                            <span>{doc}</span>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-danger ms-1"
                              onClick={() => handleRemoveDoc(doc)}
                              title="Remove"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted small py-2">
                        No documents added yet. Select from the dropdown above.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Truly Optional Identification details */}
              <div className="col-12 col-md-6 mt-3">
                <div className="form-group-custom">
                  <div className="d-flex justify-content-between">
                    <label className="fw-bold small mb-1">Aadhaar Number</label>
                    <span className="text-muted small">Optional</span>
                  </div>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData(prev => ({ ...prev, aadhaarNumber: clean }));
                    }}
                    placeholder="12-digit Aadhaar (Leave blank if not available)"
                    className="form-control-custom w-100"
                    maxLength={12}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 mt-3">
                <div className="form-group-custom">
                  <div className="d-flex justify-content-between">
                    <label className="fw-bold small mb-1">PAN Number</label>
                    <span className="text-muted small">Optional</span>
                  </div>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => {
                      const clean = e.target.value.toUpperCase().slice(0, 10);
                      setFormData(prev => ({ ...prev, panNumber: clean }));
                    }}
                    placeholder="10-digit PAN (Leave blank if not available)"
                    className="form-control-custom w-100"
                    maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="col-12">
                <div className="form-group-custom">
                  <label className="fw-bold small mb-1">Internal Remarks / Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="HR notes, batch number, process remarks..."
                    className="form-control-custom w-100"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            </div>

            {/* Footer Actions */}
            <div className="modal-footer-custom d-flex gap-3 px-4 py-3 border-top bg-white flex-shrink-0">
              <button
                type="button"
                className="btn btn-light-custom flex-grow-1"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary-custom flex-grow-2 d-flex align-items-center justify-content-center gap-2"
                disabled={saving}
              >
                {saving ? <FiLoader className="spinner-icon" /> : <FiUser />}
                {saving ? 'Registering & Dispatching Email...' : 'Submit & Send Acknowledgement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterCandidateModal;
