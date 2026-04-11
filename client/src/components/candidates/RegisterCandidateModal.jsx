import React, { useState } from 'react';
import { FiX, FiUser, FiCheck, FiLoader } from 'react-icons/fi';
import api from '../../utils/api';
import './RegisterCandidateModal.css';

const RegisterCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    panNumber: '',
    educationalQualification: '',
    experienceDetails: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/candidates', formData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', email: '', phone: '', aadhaarNumber: '',
      panNumber: '', educationalQualification: '', experienceDetails: '', notes: '',
    });
    setSuccess(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-custom-overlay d-flex align-items-center justify-content-center" onClick={onClose}>
      <div className="modal-custom-content rc-modal-content animate-scaleIn" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-custom-header d-flex align-items-center justify-content-between">
          <div>
            <h2 className="modal-title-custom">Register Candidate</h2>
            <div className="modal-subtitle-custom">New Personnel Record</div>
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
            <h3 className="h4 font-extrabold text-navy">Candidate Registered!</h3>
            <p className="text-secondary font-medium">The candidate profile has been created successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-custom-body">
            {error && (
              <div className="rc-error-banner mb-4">
                {error}
              </div>
            )}

            <div className="row g-3">
              {/* Full Name */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Full Name <span className="text-danger">*</span></label>
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

              {/* Email */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E.g. candidate@email.com"
                    className="form-control-custom w-100"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="E.g. +91 98765 43210"
                    className="form-control-custom w-100"
                  />
                </div>
              </div>

              {/* Aadhaar */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar"
                    className="form-control-custom w-100"
                    maxLength={12}
                  />
                </div>
              </div>

              {/* PAN */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="E.g. ABCDE1234F"
                    className="form-control-custom w-100"
                    maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              {/* Education */}
              <div className="col-12 col-md-6">
                <div className="form-group-custom">
                  <label>Educational Qualification</label>
                  <input
                    type="text"
                    name="educationalQualification"
                    value={formData.educationalQualification}
                    onChange={handleChange}
                    placeholder="E.g. B.Tech CSE – 2022"
                    className="form-control-custom w-100"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="col-12">
                <div className="form-group-custom">
                  <label>Experience Details</label>
                  <textarea
                    name="experienceDetails"
                    value={formData.experienceDetails}
                    onChange={handleChange}
                    placeholder="Previous roles, companies, years of experience..."
                    className="form-control-custom w-100"
                    rows={2}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="col-12">
                <div className="form-group-custom">
                  <label>Internal Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Recruiter notes, remarks, flags..."
                    className="form-control-custom w-100"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="modal-footer-custom d-flex gap-3 mt-4 pt-4 border-top">
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
                {saving ? 'Registering...' : 'Register Candidate'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterCandidateModal;
