import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../utils/api';
import DocumentTable from '../components/documents/DocumentTable';
import UploadModal from '../components/documents/UploadModal';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';
import MetadataEditModal from '../components/documents/MetadataEditModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import './Documents.css';

const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categoryParam || '');
  
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/documents', {
        params: {
          search,
          category: category !== 'All' ? category : undefined
        }
      });
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [category]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchDocuments();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this document to the Recycle Bin?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDownload = (doc) => {
    const baseUrl = 'http://localhost:5000';
    const relativePath = doc.filePath.replace(/\\/g, '/').replace('uploads/', '');
    const url = `${baseUrl}/uploads/${relativePath}`;
    window.open(url, '_blank');
  };

  const categories = [
    'All', 'MOU', 'NOC', 'SLA', 'Candidate', 'Offer Letters', 
    'Posters', 'Legal', 'HR', 'Client', 'Miscellaneous'
  ];

  return (
    <div className="documents-wrapper">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5">
        <div>
          <h1 className="h2 mb-1">Document Library</h1>
          <p className="text-secondary font-medium m-0">Manage, search, and organize all official corporation documentation</p>
        </div>
        <button 
          className="btn btn-primary-custom d-flex align-items-center justify-content-center gap-2"
          onClick={() => setIsUploadOpen(true)}
        >
          <FiPlus fontSize="1.25rem" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="control-bar card-enterprise p-4 mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-8">
            <div className="d-flex align-items-center gap-3 overflow-auto pb-2 scrollbar-hide">
              <div className="filter-label d-flex align-items-center gap-2">
                <FiFilter />
                <span>Categories</span>
              </div>
              <div className="d-flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setSearchParams(cat === 'All' ? {} : { category: cat });
                    }}
                    className={`btn-filter ${category === cat || (cat === 'All' && !category) ? 'active' : ''}`}
                  >
                    {cat}
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
                placeholder="Search by title or tags..." 
                className="form-control-custom w-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
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
            onEdit={(doc) => { setSelectedDoc(doc); setIsEditOpen(true); }}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        )}
      </div>

      {/* Action Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={fetchDocuments}
      />

      <DocumentPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={selectedDoc}
      />

      <MetadataEditModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        document={selectedDoc}
        onUpdateSuccess={fetchDocuments}
      />
    </div>
  );
};

export default Documents;
