import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiLoader, FiTag, FiCalendar } from 'react-icons/fi';
import api from '../../utils/api';
import './MetadataEditModal.css';

const MetadataEditModal = ({ isOpen, onClose, document: doc, onUpdateSuccess }) => {
  const [metadata, setMetadata] = useState({
    title: '',
    companyName: 'Skilnexia',
    category: '',
    description: '',
    confidentiality: '',
    expiryDate: ''
  });
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const companies = ['Skilnexia', 'Antigraviity', 'Forge India Connect'];
  const categories = [
    'MOU', 'NOC', 'SLA', 'Offer Letters', 'HR Documents', 
    'Legal Documents', 'Posters', 'Candidate Documents', 
    'Client Documents', 'Miscellaneous'
  ];

  useEffect(() => {
    if (doc) {
      setMetadata({
        title: doc.title || '',
        companyName: doc.companyName || 'Skilnexia',
        category: doc.category || 'Miscellaneous',
        description: doc.description || '',
        confidentiality: doc.confidentiality || 'Internal',
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : ''
      });
    }
  }, [doc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/documents/${doc._id}`, metadata);
      setSuccess(true);
      setTimeout(() => {
        onUpdateSuccess && onUpdateSuccess();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update document metadata');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !doc) return null;

  return (
    <div className="modal-custom-overlay d-flex align-items-center justify-content-center" onClick={onClose}>
      <div className="modal-small-content animate-scaleIn" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-custom-header d-flex align-items-center justify-content-between">
          <div>
            <h2 className="modal-title-custom">Refine Properties</h2>
            <div className="modal-subtitle-custom">Edit Document Metadata</div>
          </div>
          <button className="btn-close-modal-custom" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {success ? (
          <div className="edit-success-state text-center py-5 px-4">
            <div className="success-icon-box mx-auto mb-4">
              <FiCheck />
            </div>
            <h3 className="h5 font-extrabold text-navy">Metadata Updated</h3>
            <p className="text-secondary font-medium small">Your changes have been synchronized with the central index.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column" style={{ flex: 1, minHeight: 0 }}>
            {/* Scrollable form body */}
            <div className="modal-custom-body p-4">
              <div className="form-group-custom mb-4">
                <label>Document Title</label>
                <input 
                  type="text" 
                  value={metadata.title} 
                  onChange={e => setMetadata({...metadata, title: e.target.value})}
                  className="input-premium w-100"
                  required
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="form-group-custom">
                    <label>Company</label>
                    <select 
                      value={metadata.companyName} 
                      onChange={e => setMetadata({...metadata, companyName: e.target.value})}
                      className="input-premium w-100"
                    >
                      {companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                    </select>
                  </div>
                </div>

                <div className="col-6">
                  <div className="form-group-custom">
                    <label className="d-flex align-items-center gap-2">
                      <FiTag className="text-primary" />
                      Category
                    </label>
                    <select 
                      value={metadata.category} 
                      onChange={e => setMetadata({...metadata, category: e.target.value})}
                      className="input-premium w-100"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="col-6">
                  <div className="form-group-custom">
                    <label>Security Level</label>
                    <select 
                      value={metadata.confidentiality} 
                      onChange={e => setMetadata({...metadata, confidentiality: e.target.value})}
                      className="input-premium w-100"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Public">Public</option>
                      <option value="Confidential">Confidential</option>
                      <option value="Highly Confidential">Highly Confidential</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group-custom mb-4">
                <label>Description (Internal Use)</label>
                <textarea 
                  value={metadata.description} 
                  onChange={e => setMetadata({...metadata, description: e.target.value})}
                  placeholder="Optional notes..."
                  className="input-premium w-100"
                  rows="3"
                />
              </div>

              <div className="form-group-custom mb-3">
                <label className="d-flex align-items-center gap-2">
                  <FiCalendar className="text-primary" />
                  Expiration
                </label>
                <input 
                  type="date" 
                  value={metadata.expiryDate} 
                  onChange={e => setMetadata({...metadata, expiryDate: e.target.value})}
                  className="input-premium w-100"
                />
              </div>
            </div>

            {/* Sticky Footer Actions - always visible */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-light-custom px-4" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-premium px-5"
                disabled={updating}
              >
                {updating ? <FiLoader className="spinner-icon" /> : <FiCheck fontSize="1.1rem" />}
                {updating ? 'Saving...' : 'Update Records'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MetadataEditModal;
