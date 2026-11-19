import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiUsers, FiFilter, FiCheckCircle, 
  FiClock, FiLayers, FiGrid, FiList, FiBriefcase, FiUser 
} from 'react-icons/fi';
import api from '../utils/api';
import DocumentTrackingTable from '../components/candidates/DocumentTrackingTable';
import CandidateGrid from '../components/candidates/CandidateGrid';
import RegisterCandidateModal from '../components/candidates/RegisterCandidateModal';
import CandidateDetailsModal from '../components/candidates/CandidateDetailsModal';
import UploadModal from '../components/documents/UploadModal';
import EmptyState from '../components/common/EmptyState';
import LoadingOverlay from '../components/common/LoadingOverlay';
import './Candidates.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [collectionStatus, setCollectionStatus] = useState('All');
  const [selectedProcess, setSelectedProcess] = useState('All');
  const [selectedHr, setSelectedHr] = useState('All');

  // Metadata options
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [availableHrs, setAvailableHrs] = useState([]);

  // View Mode: 'table' (Dedicated Tracking Table) vs 'cards' (Grid)
  const [viewMode, setViewMode] = useState('table');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [uploadCandidate, setUploadCandidate] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load filter options (Programs, HRs)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const { data } = await api.get('/candidates/metadata/options');
        if (data.programs) setAvailablePrograms(data.programs);
        if (data.hrList) setAvailableHrs(data.hrList);
      } catch (e) {
        console.error('Failed to load metadata options:', e);
      }
    };
    loadMetadata();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        collectionStatus: collectionStatus !== 'All' ? collectionStatus : undefined,
        processName: selectedProcess !== 'All' ? selectedProcess : undefined
      };

      const { data } = await api.get('/candidates', { params });
      
      // If HR filter is chosen client-side (or server-side)
      let filtered = data;
      if (selectedHr !== 'All') {
        filtered = filtered.filter(c => c.hrName === selectedHr);
      }

      setCandidates(filtered);

      // Keep detail modal updated if open
      if (selectedCandidate) {
        const updated = filtered.find(c => c._id === selectedCandidate._id);
        if (updated) setSelectedCandidate(updated);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [collectionStatus, selectedProcess, selectedHr]);

  // Debounced search when user types name, mobile number, process, or HR
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleOpenUploadForCandidate = (candidate) => {
    setUploadCandidate(candidate);
    setIsUploadOpen(true);
  };

  const handleAction = async (type, candidate) => {
    switch (type) {
      case 'view':
        handleViewDetails(candidate);
        break;

      case 'mark-collected':
        try {
          await api.patch(`/candidates/${candidate._id}/collection-status`, {
            collectionStatus: 'Already Doc Collected',
            collectedDate: new Date()
          });
          showToast(`Marked documents as collected for ${candidate.fullName}`);
          fetchCandidates();
        } catch (error) {
          showToast(error.response?.data?.message || 'Failed to update collection status', 'danger');
        }
        break;

      case 'mark-submitted':
        try {
          await api.patch(`/candidates/${candidate._id}/collection-status`, {
            collectionStatus: 'Submitted'
          });
          showToast(`Reverted status to Submitted for ${candidate.fullName}`);
          fetchCandidates();
        } catch (error) {
          showToast(error.response?.data?.message || 'Failed to update status', 'danger');
        }
        break;

      case 'send-ack':
        try {
          const { data } = await api.post(`/candidates/${candidate._id}/send-ack`);
          showToast(data.message || `Acknowledgement email sent to ${candidate.email}`);
        } catch (error) {
          showToast(error.response?.data?.message || 'Failed to send email acknowledgement', 'danger');
        }
        break;

      case 'upload':
        handleOpenUploadForCandidate(candidate);
        break;

      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${candidate.fullName}? This cannot be undone.`)) {
          try {
            await api.delete(`/candidates/${candidate._id}`);
            showToast(`Deleted candidate profile for ${candidate.fullName}`);
            fetchCandidates();
          } catch (error) {
            showToast('Failed to delete candidate', 'danger');
          }
        }
        break;

      default:
        console.log('Action:', type, candidate);
    }
  };

  const statusOptions = ['All', 'Submitted', 'Already Doc Collected', 'Pending Submission'];

  return (
    <div className="candidates-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          className={`alert alert-${toastMessage.type} shadow-lg position-fixed top-0 start-50 translate-middle-x mt-4`}
          style={{ zIndex: 9999, minWidth: '320px', borderRadius: '12px' }}
        >
          {toastMessage.message}
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="candidate-header-icon-box">
            <FiLayers />
          </div>
          <div>
            <h1 className="h3 fw-bold mb-1 text-dark">Document Tracking & Candidate Portal</h1>
            <p className="text-secondary small m-0">
              Track candidate document submissions, collection dates, process, HR handling, and audit history
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* View Mode Switcher: Table vs Cards */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Tracking Table View"
            >
              <FiList />
              <span>Tracking Table</span>
            </button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
            >
              <FiGrid />
              <span>Directory Cards</span>
            </button>
          </div>

          <button 
            className="btn btn-primary-custom d-flex align-items-center gap-2 px-3 py-2 fw-bold"
            onClick={() => setIsRegisterOpen(true)}
          >
            <FiPlus fontSize="1.15rem" />
            <span>Register Candidate & Docs</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter & Search Bar */}
      <div className="candidate-control-bar p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center">
          {/* Universal Search Bar */}
          <div className="col-12 col-lg-5">
            <form onSubmit={handleSearchSubmit} className="position-relative">
              <FiSearch 
                className="position-absolute top-50 translate-middle-y text-muted ms-3" 
                style={{ fontSize: '1.05rem' }} 
              />
              <input 
                type="text" 
                placeholder="Search by candidate name, mobile (10 digits), process, HR..." 
                className="form-control-custom w-100 ps-5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  type="button" 
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none pe-3"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Process Filter Dropdown */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="d-flex align-items-center gap-2">
              <FiBriefcase className="text-secondary small flex-shrink-0" />
              <select
                className="form-select-custom w-100 form-control-sm"
                value={selectedProcess}
                onChange={(e) => setSelectedProcess(e.target.value)}
              >
                <option value="All">All Processes / Programs</option>
                {availablePrograms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* HR Handler Filter Dropdown */}
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="d-flex align-items-center gap-2">
              <FiUser className="text-secondary small flex-shrink-0" />
              <select
                className="form-select-custom w-100 form-control-sm"
                value={selectedHr}
                onChange={(e) => setSelectedHr(e.target.value)}
              >
                <option value="All">All Handling HRs</option>
                {availableHrs.map(hr => (
                  <option key={hr} value={hr}>{hr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Tabs Row */}
          <div className="col-12 pt-2 border-top">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-secondary fw-bold me-2">Document Status:</span>
              <div className="filter-pills-row">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setCollectionStatus(opt)}
                    className={`btn-filter-pill ${collectionStatus === opt ? 'active' : ''}`}
                  >
                    {opt === 'Already Doc Collected' ? '✓ ' : opt === 'Submitted' ? '● ' : ''}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Display */}
      <div className="candidates-content">
        {loading ? (
          <div className="p-5">
            <LoadingOverlay />
          </div>
        ) : candidates.length > 0 ? (
          viewMode === 'table' ? (
            <DocumentTrackingTable 
              candidates={candidates} 
              onViewDetails={handleViewDetails}
              onAction={handleAction}
              onUploadDoc={handleOpenUploadForCandidate}
            />
          ) : (
            <CandidateGrid 
              candidates={candidates} 
              onUpdate={fetchCandidates} 
              onViewDetails={handleViewDetails}
              onAction={handleAction}
            />
          )
        ) : (
          <div className="card-enterprise p-5">
            <EmptyState 
              icon={<FiUsers />} 
              title="No Candidates Found" 
              message={
                search 
                  ? `No record found matching "${search}". Try searching with another name, 10-digit mobile number, or clear filters.`
                  : "No personnel records matching your filter criteria were located."
              }
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <RegisterCandidateModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchCandidates}
      />

      <CandidateDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        candidate={selectedCandidate}
        onUpdate={fetchCandidates}
        onUploadDoc={handleOpenUploadForCandidate}
      />

      {uploadCandidate && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => {
            setIsUploadOpen(false);
            setUploadCandidate(null);
          }}
          onUploadSuccess={() => {
            fetchCandidates();
            showToast(`Document uploaded successfully for ${uploadCandidate.fullName}`);
          }}
          candidateId={uploadCandidate._id}
          candidateName={uploadCandidate.fullName}
        />
      )}
    </div>
  );
};

export default Candidates;
