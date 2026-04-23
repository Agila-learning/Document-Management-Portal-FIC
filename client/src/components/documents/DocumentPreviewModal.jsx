import React from 'react';
import { FiX, FiDownload, FiExternalLink, FiMaximize2, FiFileText, FiImage } from 'react-icons/fi';
import { BASE_URL } from '../../utils/api';
import './DocumentPreviewModal.css';

const DocumentPreviewModal = ({ isOpen, onClose, document: doc }) => {
  if (!isOpen || !doc) return null;

  const getFileUrl = () => {
    if (!doc.filePath) return '';
    
    // If it's an absolute URL (Cloudinary), return it directly
    if (doc.filePath.startsWith('http')) {
      return doc.filePath;
    }
    
    // Normalize path separators for local files
    const normalized = doc.filePath.replace(/\\/g, '/');
    
    // If path starts with uploads/, remove it so we don't double it up
    let cleanPath = normalized;
    if (normalized.includes('uploads/')) {
      cleanPath = normalized.split('uploads/').pop();
    }
    
    // Ensure BASE_URL doesn't end with slash and path doesn't start with one
    const base = BASE_URL.replace(/\/$/, '');
    const path = cleanPath.replace(/^\//, '');
    
    return `${base}/uploads/${encodeURI(path)}`;
  };


  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(doc.fileType?.replace('.', '').toLowerCase());
  const isPDF = doc.fileType?.replace('.', '').toLowerCase() === 'pdf';

  return (
    <div className="preview-overlay d-flex align-items-center justify-content-center" onClick={onClose}>
      <div className="modal-enterprise-content" onClick={e => e.stopPropagation()}>
        {/* Preview Header */}
        <div className="preview-header-modern d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className={`preview-type-icon ${isImage ? 'theme-image' : 'theme-pdf'}`}>
              {isImage ? <FiImage /> : <FiFileText />}
            </div>
            <div>
              <h2 className="preview-title mb-1">{doc.title}</h2>
              <div className="d-flex align-items-center gap-2">
                <span className="preview-cat-badge">{doc.category}</span>
                <span className="text-secondary small font-bold">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <a 
              href={getFileUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-preview-action"
              title="Open in New Tab"
            >
              <FiExternalLink />
            </a>
            <button className="btn-close-preview" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* Preview Body */}
        <div className="preview-viewport-main d-flex align-items-center justify-content-center">
          {isImage ? (
            <div className="preview-image-container">
              <img 
                src={getFileUrl()} 
                alt={doc.title} 
                className="img-fluid rounded shadow-sm"
              />
            </div>
          ) : isPDF ? (
            <iframe 
              src={`${getFileUrl()}#toolbar=0`} 
              title={doc.title}
              className="pdf-viewer-frame w-100 h-100 border-0"
            />
          ) : (
            <div className="no-preview-available text-center">
              <div className="mb-4">
                <FiFileText size={48} className="text-muted" />
              </div>
              <h3 className="h5 font-extrabold text-navy">Preview Unavailable</h3>
              <p className="small text-secondary font-medium mb-4">This file type ({doc.fileType}) requires a local application to view.</p>
              <a href={getFileUrl()} download className="btn btn-primary-custom px-4">
                <FiDownload className="me-2" /> Download to View
              </a>
            </div>
          )}
        </div>

        {/* Preview Footer */}
        <div className="preview-footer d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-5">
            <div className="footer-stat d-flex flex-column">
              <span className="stat-label">Uploaded On</span>
              <span className="stat-val">{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="footer-stat d-flex flex-column">
              <span className="stat-label">Confidentiality</span>
              <span className="stat-val">{doc.confidentiality || 'Internal'}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-navy-custom d-flex align-items-center gap-2"
            onClick={() => window.open(getFileUrl(), '_blank')}
          >
            <FiMaximize2 />
            <span>Full Experience</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
