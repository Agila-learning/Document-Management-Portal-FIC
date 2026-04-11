import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiFileText, FiClock } from 'react-icons/fi';
import api, { BASE_URL } from '../utils/api';
import DocumentTable from '../components/documents/DocumentTable';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';
import MetadataEditModal from '../components/documents/MetadataEditModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import './Alerts.css';

const Alerts = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAlertDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents', {
        params: { status: 'Expiring' }
      });
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching alert documents:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchAlertDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Move to Recycle Bin?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchAlertDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDownload = (doc) => {
    const relativePath = doc.filePath.replace(/\\/g, '/').replace('uploads/', '');
    window.open(`${BASE_URL}/uploads/${relativePath}`, '_blank');
  };

  return (
    <div className="alerts-wrapper animate-fade">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
        <div className="d-flex align-items-center gap-4">
          <div className="alert-header-icon-box">
            <FiAlertCircle />
          </div>
          <div>
            <h1 className="h2 mb-1">Critical Alerts</h1>
            <p className="text-secondary font-medium m-0">Documents requiring immediate attention or renewal</p>
          </div>
        </div>
        <div className="alert-stats-pill">
          <div className="pill-item">
            <span className="pill-value text-danger">{documents.length}</span>
            <span className="pill-label">Urgent</span>
          </div>
          <div className="pill-divider" />
          <div className="pill-item">
            <span className="pill-value text-amber">30</span>
            <span className="pill-label">Days Left</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert-notice-board mb-5">
        <div className="notice-icon-circle">
          <FiClock />
        </div>
        <div className="notice-content">
          <h4 className="notice-title">Compliance Protocol Active</h4>
          <p className="notice-text">
            Documents listed below are within <strong>30 days of expiration</strong>. Failure to update certificates or licenses may impact operational continuity.
          </p>
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
            onEdit={(doc) => { setSelectedDoc(doc); setIsEditOpen(true); }}
            onDelete={handleDelete}
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

      <MetadataEditModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        document={selectedDoc}
        onUpdateSuccess={fetchAlertDocuments}
      />
    </div>
  );
};

export default Alerts;
