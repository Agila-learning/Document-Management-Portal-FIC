import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiDollarSign, FiCalendar, FiUser, FiInfo, 
  FiCheckCircle, FiClock, FiPlus, FiFilter 
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';

const PayrollManagement = () => {
  const { activeCompany } = useAuth();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCompany, setSelectedCompany] = useState(activeCompany || 'All');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  const companiesList = ['All', 'Skilnexia', 'Antigraviity', 'Forge India Connect'];
  
  const [newRecord, setNewRecord] = useState({
    employeeId: '',
    lopDays: 0,
    baseSalary: 0
  });

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, 
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payrollRes, employeeRes] = await Promise.all([
        api.get('/payroll', { 
          params: { 
            month: selectedMonth, 
            year: selectedYear,
            companyName: selectedCompany 
          } 
        }),
        api.get('/employees', { 
          params: { 
            companyName: selectedCompany === 'All' ? undefined : selectedCompany 
          } 
        })
      ]);
      setRecords(payrollRes.data);
      setEmployees(employeeRes.data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, selectedCompany]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll', {
        ...newRecord,
        month: selectedMonth,
        year: selectedYear
      });
      setIsLogModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error logging payroll');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/payroll/${id}/status`, { paymentStatus: status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <>
      <div className="payroll-wrapper animate-fade">
        <div className="page-header d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="h3 font-extrabold text-navy m-0">Payroll Console</h1>
            <p className="text-secondary small mt-1">Month-wise salary maintenance and LOP tracking</p>
          </div>
          <button 
            className="btn btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => setIsLogModalOpen(true)}
          >
            <FiPlus />
            <span>Generate Record</span>
          </button>
        </div>

        {/* Control Bar */}
        <div className="bg-white p-3 rounded shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <div className="filter-group">
              <label className="field-label-mini">Select Month</label>
              <select 
                className="form-select border-0 bg-light-soft fw-semibold"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="field-label-mini">Select Year</label>
              <select 
                className="form-select border-0 bg-light-soft fw-semibold"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="field-label-mini">Company Workspace</label>
              <select 
                className="form-select border-0 bg-primary-soft text-primary fw-bold"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companiesList.map(comp => <option key={comp} value={comp}>{comp}</option>)}
              </select>
            </div>
          </div>
          <div className="stats-mini d-flex gap-4">
            <div className="text-end">
              <div className="text-secondary tiny text-uppercase tracking-tighter font-bold">Total Payroll</div>
              <div className="h5 font-extrabold text-primary m-0">₹{records.reduce((acc, curr) => acc + curr.calculatedSalary, 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Syncing payroll data...</div>
        ) : records.length > 0 ? (
          <div className="card-enterprise overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle m-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Employee</th>
                    <th>Designation</th>
                    <th>Base Salary</th>
                    <th>LOP Days</th>
                    <th>Net Payable</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-sm">{rec.employee?.fullName?.charAt(0)}</div>
                          <div className="font-bold text-navy">{rec.employee?.fullName}</div>
                        </div>
                      </td>
                      <td className="small font-semibold text-secondary">{rec.employee?.designation}</td>
                      <td className="font-bold">₹{rec.baseSalary?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${rec.lopDays > 0 ? 'bg-danger-light text-danger' : 'bg-success-light text-success'}`}>
                          {rec.lopDays} Days
                        </span>
                      </td>
                      <td className="font-extrabold text-primary">₹{rec.calculatedSalary?.toLocaleString()}</td>
                      <td>
                        {rec.paymentStatus === 'Paid' ? (
                          <span className="badge-paid"><FiCheckCircle className="me-1" /> Paid</span>
                        ) : (
                          <span className="badge-pending"><FiClock className="me-1" /> {rec.paymentStatus}</span>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        {rec.paymentStatus !== 'Paid' && (
                          <button 
                            className="btn btn-sm btn-navy-custom"
                            onClick={() => updateStatus(rec._id, 'Paid')}
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState 
            icon={<FiDollarSign />} 
            title="No Payroll Records" 
            message={`We couldn't find any salary data for ${months.find(m => m.value === selectedMonth).label} ${selectedYear}.`}
          />
        )}
      </div>

      {/* Log Payroll Modal - Using React Portal to break out of all stacking contexts */}
      {isLogModalOpen && createPortal(
        <div className="modal-custom-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-custom-content animate-slideUp" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-custom-header d-flex justify-content-between align-items-center">
              <div>
                <h2 className="modal-title-custom">Generate Salary Record</h2>
                <span className="modal-subtitle-custom">Process monthly payroll for {months.find(m => m.value === selectedMonth).label} {selectedYear}</span>
              </div>
              <button className="btn-close-modal-custom" onClick={() => setIsLogModalOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-custom-body">
              <form onSubmit={handleCreateRecord}>
                <div className="row g-4">
                  <div className="col-12">
                    <div className="form-group-custom">
                      <label>Select Employee</label>
                      <select 
                        className="form-control-custom w-100" 
                        required 
                        value={newRecord.employeeId}
                        onChange={(e) => {
                          const emp = employees.find(emp => emp._id === e.target.value);
                          setNewRecord({
                            ...newRecord, 
                            employeeId: e.target.value,
                            baseSalary: emp ? emp.baseSalary : 0
                          });
                        }}
                      >
                        <option value="">Choose Employee...</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label>Base Salary (₹)</label>
                      <input 
                        type="number" 
                        step="any"
                        className="form-control-custom w-100" 
                        placeholder="Enter amount"
                        required
                        value={newRecord.baseSalary}
                        onChange={e => setNewRecord({...newRecord, baseSalary: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group-custom">
                      <label>LOP Days</label>
                      <input 
                        type="number" 
                        className="form-control-custom w-100" 
                        required 
                        min="0"
                        max="31"
                        value={newRecord.lopDays}
                        onChange={e => setNewRecord({...newRecord, lopDays: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <div className="p-4 bg-primary-soft rounded-3 mb-4 d-flex justify-content-between align-items-center border border-primary border-opacity-10">
                      <div>
                        <div className="text-secondary small font-bold text-uppercase tracking-wider mb-1">Estimated Net Salary</div>
                        <div className="h4 text-primary font-extrabold m-0">
                          ₹{Math.round((newRecord.baseSalary / 30) * (30 - newRecord.lopDays)).toLocaleString()}
                        </div>
                      </div>
                      <FiCheckCircle className="text-primary h3 m-0 opacity-20" />
                    </div>
                    <button type="submit" className="btn btn-primary-custom w-100 py-3 font-bold h5">Confirm & Generate Record</button>
                    <p className="text-center text-secondary tiny mt-3 font-semibold text-uppercase tracking-tighter">
                      This record will be logged for the {selectedCompany} workspace
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        .bg-primary-soft { background: rgba(37, 99, 235, 0.05); }
        .bg-light-soft { background: #f8fafc; }
        .field-label-mini { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .tiny { font-size: 9px; }
        .avatar-sm { width: 32px; height: 32px; background: #eff6ff; color: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        .badge-paid { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .badge-pending { background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
      `}</style>
    </>
  );
};

export default PayrollManagement;
