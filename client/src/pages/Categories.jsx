import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFolder, FiChevronRight, FiPlus, FiSearch, 
  FiFilter, FiArrowUp, FiArrowDown, FiMoreVertical 
} from 'react-icons/fi';
import api from '../utils/api';
import EmptyState from '../components/common/EmptyState';
import UploadModal from '../components/documents/UploadModal';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'count'
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const navigate = useNavigate();

  const companies = ['All', 'Skilnexia', 'Antigraviity', 'Forge India Connect'];

  // Master list of categories
  const [categoryList, setCategoryList] = useState([
    { id: 1, name: 'MOU', description: 'Memorandums of Understanding and agreements.' },
    { id: 2, name: 'NOC', description: 'No Objection Certificates and clearances.' },
    { id: 3, name: 'SLA', description: 'Service Level Agreements for clients.' },
    { id: 4, name: 'Offer Letters', description: 'Employment and recruitment records.' },
    { id: 5, name: 'HR Documents', description: 'Personnel management and internal HR files.' },
    { id: 6, name: 'Legal Documents', description: 'Court documents, patents, and legal forms.' },
    { id: 7, name: 'Posters', description: 'Visual assets and event graphics.' },
    { id: 8, name: 'Candidate Documents', description: 'Personal onboarding and KYC files.' },
    { id: 9, name: 'Client Documents', description: 'Project specific client documentation.' },
    { id: 10, name: 'Miscellaneous', description: 'General files and uncategorized media.' }
  ]);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const { data } = await api.get('/stats/dashboard', { params: { companyName: selectedCompany } });
        setCategories(data.categoryStats || []);
      } catch (error) {
        console.error('Error fetching category stats:', error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchCategoryStats();
  }, [selectedCompany]);

  const handleCategoryClick = (category) => {
    navigate(`/documents?category=${encodeURIComponent(category)}${selectedCompany !== 'All' ? `&company=${encodeURIComponent(selectedCompany)}` : ''}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Filter and Sort Logic
  const filteredAndSorted = categoryList
    .filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'count') {
        const countA = categories.find(c => c._id === a.name)?.count || 0;
        const countB = categories.find(c => c._id === b.name)?.count || 0;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
      }
      return 0;
    });

  return (
    <div className="categories-page-wrapper animate-fade">
      {/* Premium Header */}
      <div className="categories-header-section mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="header-meta">
            <h1 className="display-6 font-manrope font-extrabold text-navy mb-1">Document Categories</h1>
            <p className="text-secondary font-medium m-0">Organize and manage your document library folders</p>
          </div>
          <div className="header-actions d-flex gap-3">
            <button 
              className="btn btn-navy-custom d-flex align-items-center gap-2 px-4 shadow-sm"
              onClick={() => alert('Dynamic Categories feature is coming soon! For now, please use the existing categories.')}
            >
              <FiPlus /> <span>New Category</span>
            </button>
            <button 
              className="btn btn-primary-custom d-flex align-items-center gap-2 px-4 shadow-brand"
              onClick={() => setIsUploadOpen(true)}
            >
              <FiFolder /> <span>Quick Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="categories-control-bar card-enterprise p-3 mb-5">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <div className="search-pill-box">
              <FiSearch className="search-pill-icon" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="search-pill-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-8">
            <div className="d-flex align-items-center justify-content-md-end gap-3 flex-wrap">
              <div className="sort-control d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
                <span className="small font-bold text-secondary text-uppercase tracking-wider">Workspace:</span>
                <select 
                  className="form-select-custom border-0 bg-transparent fw-semibold" 
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  {companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                </select>
              </div>
              <div className="sort-control d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
                <FiFilter className="text-secondary" />
                <span className="small font-bold text-secondary text-uppercase tracking-wider">Sort:</span>
                <select 
                  className="form-select-custom" 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Category Name</option>
                  <option value="count">File Count</option>
                  <option value="recent">Recently Updated</option>
                </select>
                <button className="btn-sort-toggle" onClick={toggleSortOrder}>
                  {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="categories-premium-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="category-skeleton-card animate-pulse" />
          ))}
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="categories-premium-grid">
          {filteredAndSorted.map((cat, idx) => {
            const stats = categories.find(c => c._id === cat.name);
            const docCount = stats ? stats.count : 0;

            return (
              <div 
                key={cat.id} 
                className="category-premium-card"
                style={{ '--delay': `${idx * 0.05}s` }}
              >
                <div className="card-inner">
                  <div className="card-head">
                    <div className="icon-box">
                      <FiFolder />
                    </div>
                    <button className="btn-more-options">
                      <FiMoreVertical />
                    </button>
                  </div>
                  
                  <div className="card-body-content">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h3 className="category-title">{cat.name}</h3>
                      <span className="file-pill">{docCount} Files</span>
                    </div>
                    <p className="category-desc">{cat.description}</p>
                  </div>

                  <div className="card-foot mt-auto">
                    <button 
                      className="btn-open-collection"
                      onClick={() => handleCategoryClick(cat.name)}
                    >
                      <span>Open Collection</span>
                      <FiChevronRight className="arrow-icon" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-container py-10">
          <EmptyState 
            icon={<FiSearch />} 
            title="No matches found" 
            message={`No categories match "${searchQuery}". Please try a different search term.`}
          />
        </div>
      )}

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={() => {
          // Re-fetch category stats (effectively a reload for now as stats are in the parent useEffect)
          window.location.reload(); 
        }}
      />
    </div>
  );
};

export default Categories;
