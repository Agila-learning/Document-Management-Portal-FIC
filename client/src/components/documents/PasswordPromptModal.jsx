import React, { useState } from 'react';
import { FiX, FiLock, FiUnlock, FiLoader, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';

const PasswordPromptModal = ({ isOpen, onClose, documentId, onVerified }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post(`/documents/${documentId}/verify-password`, { password });
      onVerified(password); // Callback with the verified password if needed
      onClose();
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid password credentials');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="modal-header-custom mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="lock-icon-circle">
              <FiLock />
            </div>
            <div>
              <h2 className="modal-title h6 font-extrabold m-0 text-navy">Protected Document</h2>
              <p className="text-secondary small m-0">Enter the decryption password to continue</p>
            </div>
          </div>
          <button className="btn-close-custom" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-group mb-4">
            <input 
              type="password" 
              className={`form-input-custom ${error ? 'border-danger' : ''}`}
              placeholder="Enter password..."
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="d-flex align-items-center gap-2 text-danger small mt-2 font-bold animate-fade">
                <FiAlertCircle /> {error}
              </div>
            )}
          </div>

          <div className="d-flex gap-3">
            <button 
              type="button" 
              className="btn btn-light-custom flex-grow-1 font-bold py-2" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary-custom flex-grow-1 d-flex align-items-center justify-content-center gap-2 font-bold py-2"
              disabled={loading || !password}
            >
              {loading ? <FiLoader className="spinner-icon" /> : <FiUnlock />}
              {loading ? 'Verifying...' : 'Unlock File'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 400px;
          padding: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .lock-icon-circle {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }
        .form-input-custom {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .form-input-custom:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default PasswordPromptModal;
