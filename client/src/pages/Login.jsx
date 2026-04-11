import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLoader, FiAlertCircle, FiShield } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection refused. Please verify the backend is operational.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade">
        <div className="login-header text-center">
          <div className="logo d-flex align-items-center justify-content-center gap-3">
            <div className="logo-icon-box">F</div>
            <div className="brand-text text-start">
              <span className="brand-title">Forge India</span>
              <span className="brand-subtitle">Connect</span>
            </div>
          </div>
          <h1 className="mt-4">Portal Login</h1>
          <p>Access the corporate document management system</p>
        </div>

        {error && (
          <div className="error-alert d-flex align-items-center gap-3">
            <FiAlertCircle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-custom">
            <label>Work Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                placeholder="admin@forgeindia.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group-custom">
            <label>Access Code</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-options d-flex align-items-center justify-content-between">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Keep me signed in
            </label>
            <button type="button" className="btn-link" onClick={() => setShowModal(true)}>
              Contact Admin
            </button>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <><FiLoader className="spinner-icon me-2" /> Authenticating...</>
            ) : (
              'Enter Portal'
            )}
          </button>
        </form>

        <div className="login-footer text-center mt-4">
          <FiShield className="me-2" />
          <span>Secure Enterprise Environment</span>
        </div>
      </div>

      {/* Contact Admin Modal */}
      {showModal && (
        <div className="modal-overlay-custom d-flex align-items-center justify-content-center" onClick={() => setShowModal(false)}>
          <div className="modal-content-custom animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h2>Administrative Support</h2>
            <p>Please contact the system administrator to reset your access tokens or register a new account.</p>
            <div className="support-card">
              <div className="support-row">
                <strong>IT Support:</strong> <span>it.support@forgeindia.com</span>
              </div>
              <div className="support-row">
                <strong>Contact No:</strong> <span>+91 999 000 1234</span>
              </div>
            </div>
            <button className="btn btn-navy w-100" onClick={() => setShowModal(false)}>
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
