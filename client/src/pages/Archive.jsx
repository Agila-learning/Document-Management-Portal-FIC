import React, { useState, useEffect } from 'react';
import { FiArchive, FiRefreshCw, FiSearch, FiInfo } from 'react-icons/fi';
import api, { BASE_URL } from '../utils/api';
import DocumentTable from '../components/documents/DocumentTable';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import './Archive.css';

const Archive = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchArchivedDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents', {
        params: { status: 'Archived', search }
      });
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchArchivedDocuments();
  }, []);

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this document to active status?')) return;
    try {
      await api.patch(`/documents/${id}/status`, { status: 'Active' });
      fetchArchivedDocuments();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const handleDownload = (doc) => {
    const relativePath = doc.filePath.replace(/\\/g, '/').replace('uploads/', '');
    window.open(`${BASE_URL}/uploads/${relativePath}`, '_blank');
  };

  return (
    <div className="archive-wrapper animate-fade">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
        <div className="d-flex align-items-center gap-4">
          <div className="archive-header-icon-box">
            <FiArchive />
          </div>
          <div>
            <h1 className="h2 mb-1 text-navy">Document Archive</h1>
            <p className="text-secondary font-medium m-0">Historical records and completed project documentation</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="archive-control-area mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-7">
            <div className="archive-info-strip">
              <div className="strip-icon">
                <FiInfo />
              </div>
              <div className="strip-text">
                <span className="strip-label">Archive Access Protocol</span>
                <p>Preserved files are available for read-only reference. Use restore to reactivate documents.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="search-box-pill">
              <FiSearch className="search-pill-icon" />
              <input 
                type="text" 
                placeholder="Search through historical records..." 
                className="search-pill-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchArchivedDocuments()}
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
            onPreview={(doc) => { setSelectedDoc(doc); setIsPreviewOpen(true); }}
            onEdit={(doc) => handleRestore(doc._id)} // Functional overload for Restore in Archive
            onDelete={() => {}} // No delete from archive without move to trash
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Modals */}
      <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={selectedDoc}
      />
    </div>
  );
};

export default Archive;
