import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiCalendar, FiUser, FiInfo, 
  FiCheckCircle, FiClock, FiPlus, FiFilter 
} from 'react-icons/fi';
import api from '../utils/api';
import EmptyState from '../components/common/EmptyState';

const PayrollManagement = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
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
        api.get('/payroll', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/employees', { params: { companyName: 'Antigraviity' } })
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
  }, [selectedMonth, selectedYear]);

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

      {/* Log Payroll Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom mb-4">
              <h2 className="modal-title h5 font-extrabold m-0">Generate Salary Record</h2>
              <button className="btn-close-custom" onClick={() => setIsLogModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateRecord}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="field-label">Select Employee</label>
                  <select 
                    className="form-input-custom" 
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
                <div className="col-md-6">
                  <label className="field-label">Base Salary</label>
                  <input 
                    type="number" 
                    className="form-input-custom bg-light" 
                    readOnly 
                    value={newRecord.baseSalary}
                  />
                </div>
                <div className="col-md-6">
                  <label className="field-label">LOP Days</label>
                  <input 
                    type="number" 
                    className="form-input-custom" 
                    required 
                    min="0"
                    max="31"
                    value={newRecord.lopDays}
                    onChange={e => setNewRecord({...newRecord, lopDays: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="col-12 mt-4">
                  <div className="p-3 bg-primary-soft rounded mb-3 d-flex justify-content-between align-items-center">
                    <span className="small text-navy font-bold">Estimated Net Salary:</span>
                    <span className="h5 text-primary font-extrabold m-0">
                      ₹{Math.round((newRecord.baseSalary / 30) * (30 - newRecord.lopDays)).toLocaleString()}
                    </span>
                  </div>
                  <button type="submit" className="btn btn-primary-custom w-100 py-3 font-bold">Confirm & Generate</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-primary-soft { background: rgba(37, 99, 235, 0.05); }
        .bg-light-soft { background: #f8fafc; }
        .field-label-mini { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .tiny { font-size: 9px; }
        .avatar-sm { width: 32px; height: 32px; background: #eff6ff; color: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        .badge-paid { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .badge-pending { background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        
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
          width: 460px;
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
        .field-label {
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

export default PayrollManagement;
