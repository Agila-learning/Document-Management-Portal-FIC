import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiUsers, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import CandidateGrid from '../components/candidates/CandidateGrid';
import RegisterCandidateModal from '../components/candidates/RegisterCandidateModal';
import CandidateDetailsModal from '../components/candidates/CandidateDetailsModal';
import EmptyState from '../components/common/EmptyState';
import LoadingOverlay from '../components/common/LoadingOverlay';
import './Candidates.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Detail Modal State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/candidates', {
        params: { search, status: status !== 'All' ? status : undefined }
      });
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [status]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchCandidates();
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleAction = async (type, candidate) => {
    switch (type) {
      case 'view':
        handleViewDetails(candidate);
        break;
      case 'edit':
        // For now, reuse register modal in "edit mode" or just alert
        alert(`Edit feature for ${candidate.fullName} coming soon!`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${candidate.fullName}?`)) {
          try {
            await api.delete(`/candidates/${candidate._id}`);
            fetchCandidates();
          } catch (error) {
            alert('Failed to delete candidate');
          }
        }
        break;
      case 'incomplete':
        try {
          await api.put(`/candidates/${candidate._id}`, { verificationStatus: 'Incomplete' });
          fetchCandidates();
        } catch (error) {
          alert('Failed to update status');
        }
        break;
      case 'upload':
        // Navigate to documents or open upload modal
        window.location.href = `/documents?candidate=${candidate._id}`;
        break;
      default:
        console.log('Action:', type, candidate);
    }
  };

  const statusOptions = ['All', 'Verified', 'Pending', 'Incomplete'];

  return (
    <div className="candidates-wrapper">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
        <div className="d-flex align-items-center gap-4">
          <div className="candidate-header-icon-box card-enterprise">
            <FiUsers />
          </div>
          <div>
            <h1 className="h2 mb-1">Candidate Directory</h1>
            <p className="text-secondary font-medium m-0">Manage personnel records and document verification status</p>
          </div>
        </div>
        <button 
          className="btn btn-primary-custom d-flex align-items-center justify-content-center gap-2 px-4 py-3"
          onClick={() => setIsRegisterOpen(true)}
        >
          <FiPlus fontSize="1.25rem" />
          <span>Register Candidate</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="candidate-control-bar card-enterprise p-4 mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-8">
            <div className="d-flex align-items-center gap-3 overflow-auto pb-2 scrollbar-hide">
              <div className="filter-label d-flex align-items-center gap-2">
                <FiFilter />
                <span>Status</span>
              </div>
              <div className="d-flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setStatus(opt)}
                    className={`btn-filter ${status === opt ? 'active' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="search-box position-relative">
              <FiSearch className="search-icon-lib" />
              <input 
                type="text" 
                placeholder="Search candidates by name..." 
                className="form-control-custom w-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="candidates-content">
        {loading ? (
          <div className="p-5">
            <LoadingOverlay />
          </div>
        ) : candidates.length > 0 ? (
          <CandidateGrid 
            candidates={candidates} 
            onUpdate={fetchCandidates} 
            onViewDetails={handleViewDetails}
            onAction={handleAction}
          />
        ) : (
          <div className="card-enterprise p-5">
            <EmptyState 
              icon={<FiUsers />} 
              title="No Candidates Found" 
              message="No personnel records matching your search criteria were located."
            />
          </div>
        )}
      </div>

      <RegisterCandidateModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchCandidates}
      />

      <CandidateDetailsModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        candidate={selectedCandidate}
      />
    </div>
  );
};

export default Candidates;
