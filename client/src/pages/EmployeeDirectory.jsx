import React, { useState, useEffect } from 'react';
import { 
  FiUserPlus, FiSearch, FiFilter, FiMoreVertical, 
  FiMail, FiPhone, FiCalendar, FiDollarSign 
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import UploadModal from '../components/documents/UploadModal';
import DocumentTable from '../components/documents/DocumentTable';
import './Candidates.css'; // Reusing candidate styles for consistency

const EmployeeDirectory = () => {
  const { activeCompany } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    baseSalary: ''
  });

  // Document Management State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees', { 
        params: { companyName: activeCompany } 
      });
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDocs = async (empId) => {
    setLoadingDocs(true);
    try {
      const { data } = await api.get('/documents', {
        params: { employee: empId }
      });
      setEmployeeDocs(data);
    } catch (error) {
      console.error('Error fetching docs:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenDocs = (emp) => {
    setSelectedEmployee(emp);
    setIsDocModalOpen(true);
    fetchEmployeeDocs(emp._id);
  };

  const handleSendMail = (emp) => {
    navigate(`/send-mail?employeeId=${emp._id}`);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', { ...newEmployee, companyName: activeCompany });
      setIsAddModalOpen(false);
      setNewEmployee({
        fullName: '',
        email: '',
        phone: '',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0],
        baseSalary: ''
      });
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Error onboarding employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="candidates-wrapper animate-fade">
      <div className="page-header d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="h3 font-extrabold text-navy m-0">{activeCompany} Personnel</h1>
          <p className="text-secondary small mt-1">Manage active staff members and official records</p>
        </div>
        <button className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <FiUserPlus />
          <span>Onboard Employee</span>
        </button>
      </div>

      <div className="search-filter-section mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <div className="search-box-custom">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name, email or designation..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <button className="btn btn-outline-secondary-custom w-100 d-flex align-items-center justify-content-center gap-2">
              <FiFilter />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading personnel records...</div>
      ) : filteredEmployees.length > 0 ? (
        <div className="row g-4">
          {filteredEmployees.map((emp) => (
            <div className="col-12 col-md-6 col-lg-4" key={emp._id}>
              <div className="candidate-card">
                <div className="d-flex justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-placeholder">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="candidate-name">{emp.fullName}</h3>
                      <span className="candidate-spec">{emp.designation}</span>
                    </div>
                  </div>
                  <button className="btn-icon-only">
                    <FiMoreVertical />
                  </button>
                </div>
                
                <div className="candidate-meta-list mb-4">
                  <div className="meta-item">
                    <FiMail />
                    <span>{emp.email}</span>
                  </div>
                  <div className="meta-item">
                    <FiCalendar />
                    <span>Joined: {new Date(emp.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <FiDollarSign />
                    <span>Base Salary: ₹{emp.baseSalary?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-primary-custom flex-grow-1 py-2"
                    onClick={() => handleSendMail(emp)}
                  >
                    Send Email
                  </button>
                  <button 
                    className="btn btn-primary-custom flex-grow-1 py-2"
                    onClick={() => handleOpenDocs(emp)}
                  >
                    Documents
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-container py-10">
          <EmptyState 
            icon={<FiUserPlus />} 
            title="No Staff Records" 
            message="Onboard your first employee to start managing their payroll and documents."
          />
        </div>
      )}

      {/* Employee Documents Modal */}
      {isDocModalOpen && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setIsDocModalOpen(false)}>
          <div className="modal-content animate-slideUp" style={{ width: '900px', maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom mb-4 d-flex justify-content-between align-items-center">
              <div>
                <h2 className="modal-title h5 font-extrabold m-0">Library: {selectedEmployee.fullName}</h2>
                <p className="text-secondary small m-0">Manage official documents and personnel records</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary-custom d-flex align-items-center gap-2"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <FiUserPlus /> Upload New
                </button>
                <button className="btn-close-custom" onClick={() => setIsDocModalOpen(false)}>&times;</button>
              </div>
            </div>

            <div className="modal-body-scroll" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {loadingDocs ? (
                <div className="text-center py-5">Loading documents...</div>
              ) : (
                <DocumentTable 
                  documents={employeeDocs}
                  onPreview={(doc) => window.open(`${api.defaults.baseURL.replace('/api', '')}/${doc.filePath}`, '_blank')}
                  onDownload={(doc) => window.open(`${api.defaults.baseURL.replace('/api', '')}/api/documents/download/${doc._id}`, '_blank')}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Integration */}
      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        employeeId={selectedEmployee?._id}
        onUploadSuccess={() => fetchEmployeeDocs(selectedEmployee?._id)}
      />

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom mb-4">
              <h2 className="modal-title h5 font-extrabold m-0">Onboard New Employee</h2>
              <button className="btn-close-custom" onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="field-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input-custom" 
                    required 
                    value={newEmployee.fullName}
                    onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input-custom" 
                    required 
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label">Designation</label>
                  <input 
                    type="text" 
                    className="form-input-custom" 
                    required 
                    value={newEmployee.designation}
                    onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label">Joining Date</label>
                  <input 
                    type="date" 
                    className="form-input-custom" 
                    required 
                    value={newEmployee.joiningDate}
                    onChange={e => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label">Base Salary (Annual/Monthly)</label>
                  <input 
                    type="number" 
                    className="form-input-custom" 
                    required 
                    value={newEmployee.baseSalary}
                    onChange={e => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                  />
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary-custom w-100 py-3">Confirm Onboarding</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 500px;
          max-width: 90vw;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .avatar-placeholder {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          color: #2563eb;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDirectory;
