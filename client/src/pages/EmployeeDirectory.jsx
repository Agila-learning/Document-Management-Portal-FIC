import React, { useState, useEffect } from 'react';
import { 
  FiUserPlus, FiSearch, FiFilter, FiMoreVertical, 
  FiMail, FiCalendar, FiDollarSign 
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import UploadModal from '../components/documents/UploadModal';
import DocumentTable from '../components/documents/DocumentTable';
import './EmployeeDirectory.css';

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

  // Action Menu & editing State
  const [activeMenu, setActiveMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

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

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${editingEmployee._id}`, editingEmployee);
      setIsEditModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating employee');
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Are you sure you want to permanently purge the record for ${emp.fullName}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/employees/${emp._id}`);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenu(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="employees-container animate-fade">
      {/* 5. Header Alignment */}
      <div className="directory-header mb-5">
        <div>
          <h1 className="directory-title">{activeCompany} Personnel</h1>
          <p className="directory-subtitle">Manage active staff members and official records</p>
        </div>
        <button className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <FiUserPlus />
          <span>Onboard Employee</span>
        </button>
      </div>

      {/* 1. Search Bar Alignment */}
      <div className="directory-actions-bar">
        <div className="search-wrapper-full">
          <div className="search-box-large">
            <FiSearch className="search-icon-large" />
            <input 
              type="text" 
              placeholder="Search by name, email or designation..." 
              className="search-input-large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-light-custom d-flex align-items-center gap-2 py-2 px-4">
          <FiFilter />
          <span className="font-bold">Filters</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary font-bold">Syncing personnel records...</p>
        </div>
      ) : filteredEmployees.length > 0 ? (
        /* 2. Grid Layout Fix */
        <div className="employee-grid">
          {filteredEmployees.map((emp) => (
            /* 4. Card Styling Improvements */
            <div className="employee-card" key={emp._id}>
              {/* 3. Employee Card Alignment - Top Row */}
                <div className="card-header-main">
                <div className="employee-profile-box">
                  <div className="employee-avatar-lg">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div className="employee-info-text">
                    <h3 className="emp-name">{emp.fullName}</h3>
                    <span className="emp-role">{emp.designation}</span>
                  </div>
                </div>
                <div className="position-relative">
                  <button 
                    className={`card-menu-btn ${activeMenu === emp._id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === emp._id ? null : emp._id);
                    }}
                  >
                    <FiMoreVertical />
                  </button>
                  {activeMenu === emp._id && (
                    <div className="card-dropdown-menu" onClick={e => e.stopPropagation()}>
                      <button 
                        className="dropdown-item-custom"
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsEditModalOpen(true);
                          setActiveMenu(null);
                        }}
                      >
                        Edit Details
                      </button>
                      <div className="dropdown-divider-custom" />
                      <button 
                        className="dropdown-item-custom delete-text"
                        onClick={() => {
                          handleDeleteEmployee(emp);
                          setActiveMenu(null);
                        }}
                      >
                        Purge Record
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 3. Employee Card Alignment - Middle Section */}
              <div className="card-details-list">
                <div className="detail-row">
                  <FiMail className="detail-icon" />
                  <span className="text-truncate">{emp.email}</span>
                </div>
                <div className="detail-row">
                  <FiCalendar className="detail-icon" />
                  <span>Joined <span className="detail-label">{new Date(emp.joiningDate).toLocaleDateString()}</span></span>
                </div>
                <div className="detail-row">
                  <FiDollarSign className="detail-icon" />
                  <span>Salary: <span className="detail-label">₹{emp.baseSalary?.toLocaleString()}</span></span>
                </div>
              </div>

              {/* 3. Employee Card Alignment - Bottom Section */}
              <div className="card-footer-actions">
                <button 
                  className="btn-card-action btn-card-outline"
                  onClick={() => handleSendMail(emp)}
                >
                  <FiMail /> Send Email
                </button>
                <button 
                  className="btn-card-action btn-card-solid"
                  onClick={() => handleOpenDocs(emp)}
                >
                  <FiCalendar /> Documents
                </button>
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

      {/* Modals remain structurally similar but within the new container */}
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
                  onPreview={(doc) => {
                    const rel = doc.filePath.replace(/\\/g, '/').replace('uploads/', '');
                    window.open(`${api.defaults.baseURL.replace(/\/api$/, '')}/uploads/${encodeURI(rel)}`, '_blank');
                  }}
                  onDownload={(doc) => {
                    const rel = doc.filePath.replace(/\\/g, '/').replace('uploads/', '');
                    window.open(`${api.defaults.baseURL.replace(/\/api$/, '')}/uploads/${encodeURI(rel)}`, '_blank');
                  }}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        employeeId={selectedEmployee?._id}
        onUploadSuccess={() => fetchEmployeeDocs(selectedEmployee?._id)}
      />

      {/* Edit Employee Modal */}
      {isEditModalOpen && editingEmployee && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom mb-4">
              <h2 className="modal-title h5 font-extrabold m-0">Edit: {editingEmployee.fullName}</h2>
              <button className="btn-close-custom" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="field-label-custom">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    required 
                    value={editingEmployee.fullName}
                    onChange={e => setEditingEmployee({...editingEmployee, fullName: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control-custom" 
                    required 
                    value={editingEmployee.email}
                    onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Designation</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    required 
                    value={editingEmployee.designation}
                    onChange={e => setEditingEmployee({...editingEmployee, designation: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Joining Date</label>
                  <input 
                    type="date" 
                    className="form-control-custom" 
                    required 
                    value={editingEmployee.joiningDate.split('T')[0]}
                    onChange={e => setEditingEmployee({...editingEmployee, joiningDate: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Base Salary</label>
                  <input 
                    type="number" 
                    className="form-control-custom" 
                    required 
                    value={editingEmployee.baseSalary}
                    onChange={e => setEditingEmployee({...editingEmployee, baseSalary: e.target.value})}
                  />
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary-custom w-100 py-3 font-bold">Update Records</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <label className="field-label-custom">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    required 
                    value={newEmployee.fullName}
                    onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control-custom" 
                    required 
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Designation</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    required 
                    value={newEmployee.designation}
                    onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Joining Date</label>
                  <input 
                    type="date" 
                    className="form-control-custom" 
                    required 
                    value={newEmployee.joiningDate}
                    onChange={e => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label-custom">Base Salary</label>
                  <input 
                    type="number" 
                    className="form-control-custom" 
                    required 
                    value={newEmployee.baseSalary}
                    onChange={e => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                  />
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary-custom w-100 py-3 font-bold">Confirm Onboarding</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .field-label-custom {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDirectory;
