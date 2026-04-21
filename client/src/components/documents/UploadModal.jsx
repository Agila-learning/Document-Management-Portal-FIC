import React, { useState } from 'react';
import { FiX, FiUploadCloud, FiFile, FiCheck, FiLoader, FiInfo, FiLock, FiUnlock } from 'react-icons/fi';
import api from '../../utils/api';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, employeeId }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    companyName: 'Skilnexia',
    category: 'MOU',
    description: '',
    confidentiality: 'Internal',
    expiryDate: '',
    password: ''
  });
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [noExpiry, setNoExpiry] = useState(false);

  const companies = ['Skilnexia', 'Antigraviity', 'Forge India Connect'];
  const categories = [
    'MOU', 'NOC', 'SLA', 'Offer Letters', 'HR Documents', 
    'Legal Documents', 'Posters', 'Candidate Documents', 'Employee Documents', 
    'Client Documents', 'Miscellaneous'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!metadata.title) {
        setMetadata({ ...metadata, title: selectedFile.name.split('.')[0] });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', metadata.title);
    formData.append('companyName', metadata.companyName);
    formData.append('description', metadata.description);
    formData.append('confidentiality', metadata.confidentiality);
    if (employeeId) {
      formData.append('employeeId', employeeId);
      formData.append('category', 'Employee Documents'); // Auto-set for employee uploads
    } else {
      formData.append('category', metadata.category);
    }
    if (!noExpiry && metadata.expiryDate) {
      formData.append('expiryDate', metadata.expiryDate);
    }
    if (showPasswordField && metadata.password) {
      formData.append('password', metadata.password);
    }
    // File should be appended LAST to ensure other fields are available in multer
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData);
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess && onUploadSuccess();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setMetadata({ 
      title: '', 
      companyName: 'Skilnexia',
      category: 'MOU', 
      description: '', 
      confidentiality: 'Internal',
      expiryDate: '',
      password: '' 
    });
    setSuccess(false);
    setNoExpiry(false);
    setShowPasswordField(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-custom-overlay d-flex align-items-center justify-content-center" onClick={onClose}>
      <div className="modal-custom-content animate-scaleIn" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-custom-header d-flex align-items-center justify-content-between">
          <div>
            <h2 className="modal-title-custom">Upload Document</h2>
            <div className="modal-subtitle-custom">Official Company Record</div>
          </div>
          <button className="btn-close-modal-custom" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {success ? (
          <div className="upload-success-state text-center py-5">
            <div className="success-icon-box mx-auto mb-4">
              <FiCheck />
            </div>
            <h3 className="h4 font-extrabold text-navy">Upload Successful!</h3>
            <p className="text-secondary font-medium">Your document has been stored and indexed securely.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-custom-body">
            {/* Upload Zone */}
            <div className="upload-zone-wrapper mb-4">
              <input 
                type="file" 
                id="file-upload" 
                onChange={handleFileChange} 
                className="d-none"
                accept="*"
              />
              <label 
                htmlFor="file-upload" 
                className={`upload-zone-label d-flex flex-column align-items-center justify-content-center ${file ? 'has-file' : ''}`}
              >
                {file ? (
                  <div className="file-preview d-flex align-items-center gap-3 p-3 card-enterprise bg-white">
                    <div className="file-icon-box">
                      <FiFile />
                    </div>
                    <div className="file-info-mini d-flex flex-column text-start">
                      <span className="file-name-mini">{file.name}</span>
                      <span className="file-size-mini">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="btn-remove-file ms-3"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="upload-prompt text-center">
                    <div className="upload-icon-box mb-2">
                      <FiUploadCloud />
                    </div>
                    <div className="upload-text">Click to browse or drag & drop</div>
                    <div className="upload-hint">All file types supported (Max 100MB)</div>
                  </div>
                )}
              </label>
            </div>

            {/* Form Grid */}
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Document Title</label>
                  <input 
                    type="text" 
                    value={metadata.title} 
                    onChange={e => setMetadata({...metadata, title: e.target.value})}
                    placeholder="E.g. Candidate_Passport_John"
                    className="form-control-custom w-100"
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Company</label>
                  <select 
                    value={metadata.companyName} 
                    onChange={e => setMetadata({...metadata, companyName: e.target.value})}
                    className="form-select-custom w-100"
                  >
                    {companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Category</label>
                  <select 
                    value={metadata.category} 
                    onChange={e => setMetadata({...metadata, category: e.target.value})}
                    className="form-select-custom w-100"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Description (Optional)</label>
                  <textarea 
                    value={metadata.description} 
                    onChange={e => setMetadata({...metadata, description: e.target.value})}
                    placeholder="Provide context or notes about this file..."
                    className="form-control-custom w-100"
                    rows="2"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label className="d-flex align-items-center gap-2">
                    Confidentiality
                    <FiInfo className="text-primary" />
                  </label>
                  <select 
                    value={metadata.confidentiality} 
                    onChange={e => setMetadata({...metadata, confidentiality: e.target.value})}
                    className="form-select-custom w-100"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Public">Public (Read-only)</option>
                    <option value="Confidential">Confidential (Admins Only)</option>
                    <option value="Highly Confidential">Highly Confidential</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Expiry Date</label>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <label className="d-flex align-items-center gap-2 no-expiry-label" style={{cursor:'pointer', fontWeight:600, fontSize:'0.82rem', color:'var(--text-secondary)'}}>
                      <input
                        type="checkbox"
                        checked={noExpiry}
                        onChange={e => { setNoExpiry(e.target.checked); if(e.target.checked) setMetadata({...metadata, expiryDate: ''}); }}
                        style={{accentColor:'var(--primary-color)', width:'15px', height:'15px', cursor:'pointer'}}
                      />
                      No Expiry Date
                    </label>
                  </div>
                  {!noExpiry && (
                    <input 
                      type="date" 
                      value={metadata.expiryDate} 
                      onChange={e => setMetadata({...metadata, expiryDate: e.target.value})}
                      className="form-control-custom w-100"
                    />
                  )}
                  {noExpiry && (
                    <div className="no-expiry-badge">Document has no expiry date</div>
                  )}
                </div>
              </div>

              <div className="col-12">
                <div className="form-group-custom bg-light-soft p-3 rounded-4 border border-dashed">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="d-flex align-items-center gap-2 m-0 p-0" style={{cursor:'pointer', fontWeight:700, fontSize:'0.85rem', color:'var(--navy)'}}>
                      <FiLock className="text-primary" />
                      Password Protection
                    </label>
                    <div className="form-check form-switch m-0">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="flexSwitchCheckDefault"
                        checked={showPasswordField}
                        onChange={(e) => setShowPasswordField(e.target.checked)}
                      />
                    </div>
                  </div>
                  <p className="tiny text-secondary mb-3">Enable this to restrict access to this document via a custom password.</p>
                  
                  {showPasswordField && (
                    <div className="animate-fade">
                      <input 
                        type="password" 
                        placeholder="Enter secure password..." 
                        className="form-control-custom w-100 bg-white"
                        value={metadata.password}
                        onChange={e => setMetadata({...metadata, password: e.target.value})}
                      />
                      <div className="mt-2 d-flex align-items-center gap-2 tiny text-amber font-bold">
                        <FiInfo /> Remember this password. It cannot be recovered if lost.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-footer-custom d-flex gap-3 mt-4 pt-4 border-top">
              <button 
                type="button" 
                className="btn btn-light-custom flex-grow-1" 
                onClick={onClose}
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="btn btn-primary-custom flex-grow-2 d-flex align-items-center justify-content-center gap-2"
                disabled={!file || uploading}
              >
                {uploading ? <FiLoader className="spinner-icon" /> : <FiCheck />}
                {uploading ? 'Processing...' : 'Finalize & Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
