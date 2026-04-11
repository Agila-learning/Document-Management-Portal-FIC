import React, { useState, useEffect } from 'react';
import { FiTrash2, FiRefreshCw, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import DocumentTable from '../components/documents/DocumentTable';
import LoadingOverlay from '../components/common/LoadingOverlay';
import './RecycleBin.css';

const RecycleBin = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDeletedDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents', {
        params: { status: 'Deleted', search }
      });
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching trash:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchDeletedDocuments();
  }, []);

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this document to active status?')) return;
    try {
      await api.patch(`/documents/${id}/status`, { status: 'Active' });
      fetchDeletedDocuments();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('WARNING: This will permanently delete the file from the server. This action cannot be undone. Continue?')) return;
    try {
      await api.delete(`/documents/${id}/permanent`);
      fetchDeletedDocuments();
    } catch (error) {
      console.error('Purge failed:', error);
    }
  };

  const handlePurgeAll = async () => {
    if (!window.confirm('DANGER: This will permanently delete ALL items in the recycle bin. Continue?')) return;
    try {
      await api.delete('/documents/permanent/all');
      fetchDeletedDocuments();
    } catch (error) {
      console.error('Bulk purge failed:', error);
    }
  };

  return (
    <div className="trash-wrapper">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
        <div className="d-flex align-items-center gap-4">
          <div className="trash-header-icon-box card-enterprise">
            <FiTrash2 />
          </div>
          <div>
            <h1 className="h2 mb-1">Recycle Bin</h1>
            <p className="text-secondary font-medium m-0">Recover deleted files or purge them permanently from server storage</p>
          </div>
        </div>
        {documents.length > 0 && (
          <button 
            className="btn btn-danger-custom d-flex align-items-center justify-content-center gap-2"
            onClick={handlePurgeAll}
          >
            <FiAlertTriangle />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="trash-control-bar card-enterprise p-4 mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-6 col-lg-8">
            <div className="d-flex align-items-center gap-3 warning-note px-3 py-2 rounded-lg">
              <FiAlertTriangle className="text-warning flex-shrink-0" />
              <span className="small font-bold text-secondary">
                Items in the trash are retained for 30 days before automatic purge. Use the 'Restore' action to recover files.
              </span>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div className="search-box position-relative">
              <FiSearch className="search-icon-lib" />
              <input 
                type="text" 
                placeholder="Search trash..." 
                className="form-control-custom w-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDeletedDocuments()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container card-enterprise overflow-hidden">
        {loading ? (
          <div className="p-5">
            <LoadingOverlay />
          </div>
        ) : (
          <DocumentTable 
            documents={documents} 
            onPreview={() => {}} // No preview in trash
            onEdit={(doc) => handleRestore(doc._id)} // Functional overload for Restore
            onDelete={handlePermanentDelete} // Functional overload for Permanent Delete
            onDownload={() => {}} // No download in trash
          />
        )}
      </div>
    </div>
  );
};

export default RecycleBin;
