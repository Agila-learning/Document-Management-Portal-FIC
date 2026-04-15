import React, { useState, useEffect } from 'react';
import { FiMail, FiCheckCircle, FiSend, FiFileText, FiClock, FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import './SendMail.css';

const SendMail = () => {
  const [candidates, setCandidates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Form State
  const [purpose, setPurpose] = useState('Document Collection');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    amountPaid: '',
    paymentMode: 'Cash',
    transactionId: '',
    subject: '',
    content: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const templates = {
    'Document Collection': {
      subject: 'Acknowledgement: Original Documents Received',
      content: 'We acknowledge the receipt of your original documents submitted for verification purposes. Our team is currently reviewing them.\n\nShould we require any further documentation, our HR team will reach out to you.\n\nThank you for your cooperation.'
    },
    'NOC Signed': {
      subject: 'Confirmation: NOC Duly Signed',
      content: 'This is to confirm that the No Objection Certificate (NOC) has been signed and recorded in our system successfully. \n\nNo further actions regarding this specific document are required from your end at this moment.'
    },
    'Payment Receipt': {
      subject: 'Payment Receipt Acknowledgement',
      content: 'This email serves as a formal acknowledgement of the payment received. \n\nThe payment details have been logged in our system. Please keep this communication for your records.'
    },
    'Custom': {
      subject: 'Important Communication from HR',
      content: 'Please type your custom message here...'
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchHistory();
  }, []);

  useEffect(() => {
    // Auto-update template when purpose changes
    setFormData(prev => ({
      ...prev,
      subject: templates[purpose].subject,
      content: templates[purpose].content
    }));
  }, [purpose]);

  const fetchCandidates = async () => {
    try {
      const { data } = await api.get('/candidates');
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/mail/history?limit=10');
      setHistory(data.logs || []);
    } catch (error) {
      console.error('Error fetching mail history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setFormData(prev => ({
      ...prev,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email || '',
      candidatePhone: candidate.phone || ''
    }));
    setSearchTerm(candidate.fullName);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setFormData(prev => ({ ...prev, candidateName: val }));
    setShowDropdown(true);
    if (!val) setSelectedCandidate(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.post('/mail/send', {
        ...formData,
        amountPaid: formData.amountPaid ? Number(formData.amountPaid) : null,
        mailPurpose: purpose
      });
      
      setSuccessMsg('Email sent successfully!');
      
      // Refresh history
      fetchHistory();
      
      // Reset form (keep purpose)
      setSearchTerm('');
      setSelectedCandidate(null);
      setFormData({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        amountPaid: '',
        paymentMode: 'Cash',
        transactionId: '',
        subject: templates[purpose].subject,
        content: templates[purpose].content
      });
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send email. Check configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="sendmail-wrapper animate-fade">
      <div className="d-flex align-items-center mb-4 gap-3">
        <div className="candidate-header-icon-box card-enterprise d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, fontSize: '1.5rem', color: 'var(--primary-color)' }}>
          <FiMail />
        </div>
        <div>
          <h1 className="h2 mb-1">Communication Hub</h1>
          <p className="text-secondary font-medium m-0">Send official acknowledgements and receipts</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <form className="card-enterprise p-4" onSubmit={handleSubmit}>
            
            {/* Purpose Selector */}
            <div className="mb-4">
              <label className="form-label font-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Select Purpose</label>
              <div className="purpose-pill-container d-flex flex-wrap gap-2">
                {Object.keys(templates).map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`purpose-pill ${purpose === p ? 'active' : ''}`}
                    onClick={() => setPurpose(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-4" style={{ borderColor: 'var(--brand-border)' }} />

            {/* Recipient Details */}
            <h5 className="mb-3 font-bold text-navy">Recipient Details</h5>
            <div className="row g-3">
              <div className="col-md-6 position-relative">
                <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Candidate Name *</label>
                <div className="search-input-wrapper position-relative">
                  <FiSearch className="position-absolute" style={{ top: 12, left: 12, color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="form-control-custom w-100"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Search candidate or type name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    required
                  />
                </div>
                
                {/* Autocomplete Dropdown */}
                {showDropdown && searchTerm && !selectedCandidate && (
                  <div className="autocomplete-dropdown shadow-sm card-enterprise" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredCandidates.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {filteredCandidates.map(c => (
                          <button
                            key={c._id}
                            type="button"
                            className="list-group-item list-group-item-action border-0 py-2"
                            onClick={() => handleSelectCandidate(c)}
                          >
                            <div className="font-bold text-navy">{c.fullName}</div>
                            <small className="text-secondary">{c.email || 'No email'}</small>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-secondary small">No candidates found</div>
                    )}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Email Address *</label>
                <input
                  type="email"
                  name="candidateEmail"
                  className="form-control-custom w-100"
                  placeholder="candidate@example.com"
                  value={formData.candidateEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Payment Fields */}
            {purpose === 'Payment Receipt' && (
              <div className="mt-4 p-3 bg-light rounded" style={{ backgroundColor: 'var(--input-bg)' }}>
                <h6 className="font-bold text-navy mb-3"><FiCheckCircle className="me-2 text-warning"/>Payment Details</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amountPaid"
                      className="form-control-custom w-100"
                      placeholder="e.g. 5000"
                      value={formData.amountPaid}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Mode</label>
                    <select
                      name="paymentMode"
                      className="form-control-custom w-100"
                      value={formData.paymentMode}
                      onChange={handleChange}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Ref / Txn ID</label>
                    <input
                      type="text"
                      name="transactionId"
                      className="form-control-custom w-100"
                      placeholder="Optional"
                      value={formData.transactionId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="my-4" style={{ borderColor: 'var(--brand-border)' }} />

            {/* Mail Content */}
            <h5 className="mb-3 font-bold text-navy">Content</h5>
            <div className="mb-3">
              <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Subject Line *</label>
              <input
                type="text"
                name="subject"
                className="form-control-custom w-100"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label font-bold tracking-wider" style={{ fontSize: '12px' }}>Email Body *</label>
              <textarea
                name="content"
                className="form-control-custom w-100"
                rows="5"
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
              <small className="text-secondary mt-1 d-block">
                This content will be wrapped in a professional HTML template with Forge India Connect branding.
              </small>
            </div>

            {/* Status Messages */}
            {successMsg && <div className="alert alert-success d-flex align-items-center gap-2 border-0 bg-success-light text-success font-bold"><FiCheckCircle/> {successMsg}</div>}
            {errorMsg && <div className="alert alert-danger border-0 font-bold">{errorMsg}</div>}

            {/* Actions */}
            <div className="d-flex justify-content-end gap-3 mt-4">
              <button 
                type="button" 
                className="btn btn-light-custom px-4"
                onClick={() => {
                  setFormData({...formData, subject: templates[purpose].subject, content: templates[purpose].content});
                }}
              >
                Reset Template
              </button>
              <button 
                type="submit" 
                className="btn btn-primary-custom px-5 py-2 d-flex align-items-center gap-2"
                disabled={isSending}
              >
                {isSending ? (
                  <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...</>
                ) : (
                  <><FiSend/> Send Email</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar / History */}
        <div className="col-lg-4">
          <div className="card-enterprise h-100 d-flex flex-column">
            <div className="p-4 border-bottom border-brand">
              <h5 className="font-bold text-navy m-0 d-flex align-items-center gap-2">
                <FiClock /> Recent Dispatches
              </h5>
            </div>
            <div className="flex-grow-1 overflow-auto p-3" style={{ maxHeight: '600px' }}>
              {loadingHistory ? (
                <div className="text-center py-4 text-secondary">Loading history...</div>
              ) : history.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {history.map(log => (
                    <div key={log._id} className="history-item p-3 border border-brand rounded" style={{ backgroundColor: 'var(--input-bg)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary text-white" style={{ fontSize: '10px' }}>{log.mailPurpose}</span>
                        <small className="text-secondary font-medium" style={{ fontSize: '11px' }}>
                          {new Date(log.sentAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="font-bold text-navy mb-1" style={{ fontSize: '14px' }}>{log.candidateName}</div>
                      <div className="text-secondary" style={{ fontSize: '12px', wordBreak: 'break-all' }}>{log.candidateEmail}</div>
                      {log.status === 'Sent' ? (
                        <div className="text-success mt-2 font-bold" style={{ fontSize: '11px' }}><FiCheckCircle className="me-1"/> Delivered</div>
                      ) : (
                        <div className="text-danger mt-2 font-bold" style={{ fontSize: '11px' }}>Failed</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-secondary">
                  <FiFileText className="fs-1 mb-2 opacity-50" />
                  <br />No logs found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMail;
