import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFolder, FiChevronRight, FiPlus, FiSearch,
  FiFilter, FiArrowUp, FiArrowDown, FiMoreVertical,
  FiX, FiCheck
} from 'react-icons/fi';
import api from '../utils/api';
import EmptyState from '../components/common/EmptyState';
import UploadModal from '../components/documents/UploadModal';
import './Categories.css';

const Categories = () => {
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [isUploadOpen,  setIsUploadOpen]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [sortBy,        setSortBy]        = useState('name');
  const [sortOrder,     setSortOrder]     = useState('asc');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // ── New Category modal ──────────────────────────────────────────────
  const [isNewCatOpen, setIsNewCatOpen] = useState(false);
  const [newCatName,   setNewCatName]   = useState('');
  const [newCatDesc,   setNewCatDesc]   = useState('');
  const [newCatSaved,  setNewCatSaved]  = useState(false);

  const navigate  = useNavigate();
  const companies = ['All', 'Skilnexia', 'Antigraviity', 'Forge India Connect'];

  const [categoryList, setCategoryList] = useState([
    { id: 1,  name: 'MOU',                description: 'Memorandums of Understanding and agreements.'       },
    { id: 2,  name: 'NOC',                description: 'No Objection Certificates and clearances.'          },
    { id: 3,  name: 'SLA',                description: 'Service Level Agreements for clients.'              },
    { id: 4,  name: 'Offer Letters',      description: 'Employment and recruitment records.'                },
    { id: 5,  name: 'HR Documents',       description: 'Personnel management and internal HR files.'        },
    { id: 6,  name: 'Legal Documents',    description: 'Court documents, patents, and legal forms.'         },
    { id: 7,  name: 'Posters',            description: 'Visual assets and event graphics.'                  },
    { id: 8,  name: 'Candidate Documents',description: 'Personal onboarding and KYC files.'                },
    { id: 9,  name: 'Client Documents',   description: 'Project specific client documentation.'             },
    { id: 10, name: 'Miscellaneous',      description: 'General files and uncategorized media.'             },
  ]);

  // ── Fetch live file counts ──────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/dashboard', {
          params: { companyName: selectedCompany }
        });
        setCategories(data.categoryStats || []);
      } catch (err) {
        console.error('Error fetching category stats:', err);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchStats();
  }, [selectedCompany]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleCategoryClick = (name) => {
    const q = `/documents?category=${encodeURIComponent(name)}${
      selectedCompany !== 'All' ? `&company=${encodeURIComponent(selectedCompany)}` : ''
    }`;
    navigate(q);
  };

  const toggleSort = () => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));

  const handleAddCategory = () => {
    const name = newCatName.trim();
    const desc = newCatDesc.trim();
    if (!name) return;
    if (categoryList.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert('A category with that name already exists.');
      return;
    }
    setCategoryList(prev => [...prev, { id: Date.now(), name, description: desc || `Custom: ${name}` }]);
    setNewCatSaved(true);
    setTimeout(() => {
      setIsNewCatOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      setNewCatSaved(false);
    }, 1300);
  };

  // ── Filter + Sort ──────────────────────────────────────────────────
  const filteredAndSorted = categoryList
    .filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'count') {
        const ca = categories.find(c => c._id === a.name)?.count || 0;
        const cb = categories.find(c => c._id === b.name)?.count || 0;
        return sortOrder === 'asc' ? ca - cb : cb - ca;
      }
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  // ── inline styles for the modal (avoids CSS conflicts) ─────────────
  const overlay = {
    position:'fixed', inset:0, background:'rgba(2, 6, 23, 0.7)',
    backdropFilter:'blur(12px) saturate(180%)', zIndex:1200,
    display:'flex', alignItems:'center', justifyContent:'center'
  };
  const modalBox = {
    background:'rgba(255, 255, 255, 0.9)', borderRadius:24, width:460,
    maxWidth:'92vw', overflow:'hidden',
    boxShadow:'0 30px 70px rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)'
  };
  const modalHead = {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    padding:'24px 28px', display:'flex',
    alignItems:'center', justifyContent:'space-between'
  };
  const closeBtn = {
    background:'rgba(255,255,255,0.2)', border:'none', color:'#fff',
    width:36, height:36, borderRadius:'12px', display:'flex',
    alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'1.1rem',
    transition: 'all 0.2s'
  };
  const fieldLabel = {
    display:'block', fontSize:'0.75rem', fontWeight:700,
    color:'#64748b', textTransform:'uppercase',
    letterSpacing:'0.08em', marginBottom:8
  };
  const inputStyle = {
    width:'100%', border:'1px solid #f1f5f9', borderRadius:14,
    padding:'12px 16px', fontSize:'1rem', outline:'none',
    background:'#f8fafc', color:'#0f172a', boxSizing:'border-box',
    transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div className="categories-page-wrapper animate-fade">

      {/* ═══ New Category Modal ═══════════════════════════════════════ */}
      {isNewCatOpen && (
        <div style={overlay} onClick={() => setIsNewCatOpen(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={modalHead}>
              <div>
                <div style={{color:'#fff', fontWeight:800, fontSize:'1.1rem'}}>New Category</div>
                <div style={{color:'rgba(255,255,255,0.78)', fontSize:'0.75rem'}}>Add a custom document folder</div>
              </div>
              <button style={closeBtn} onClick={() => setIsNewCatOpen(false)}><FiX /></button>
            </div>

            {/* Body */}
            {newCatSaved ? (
              <div style={{padding:'40px 24px', textAlign:'center'}}>
                <div style={{
                  width:58, height:58, background:'#dcfce7', borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 16px', color:'#16a34a', fontSize:'1.6rem'
                }}>
                  <FiCheck />
                </div>
                <div style={{fontWeight:800, fontSize:'1rem', color:'#0f172a', marginBottom:6}}>Category Added!</div>
                <div style={{color:'#64748b', fontSize:'0.875rem'}}>"{newCatName}" is now available in your library.</div>
              </div>
            ) : (
              <div style={{padding:'24px'}}>
                {/* Name */}
                <div style={{marginBottom:16}}>
                  <label style={fieldLabel}>Category Name *</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="e.g. Partnership Agreements"
                    autoFocus
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
                  />
                </div>
                {/* Description */}
                <div style={{marginBottom:22}}>
                  <label style={fieldLabel}>Description (Optional)</label>
                  <textarea
                    value={newCatDesc}
                    onChange={e => setNewCatDesc(e.target.value)}
                    placeholder="Briefly describe what this folder contains..."
                    rows={3}
                    style={{...inputStyle, resize:'none'}}
                    onFocus={e => (e.target.style.borderColor = '#2563eb')}
                    onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
                {/* Buttons */}
                <div style={{display:'flex', gap:10}}>
                  <button
                    onClick={() => setIsNewCatOpen(false)}
                    style={{
                      flex:1, padding:11, border:'1.5px solid #e2e8f0',
                      borderRadius:10, background:'#f8fafc', color:'#64748b',
                      fontWeight:700, cursor:'pointer', fontSize:'0.9rem'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCatName.trim()}
                    style={{
                      flex:2, padding:11, border:'none', borderRadius:10,
                      background: newCatName.trim()
                        ? 'linear-gradient(135deg,#2563eb,#4f46e5)'
                        : '#e2e8f0',
                      color: newCatName.trim() ? '#fff' : '#a0aec0',
                      fontWeight:700,
                      cursor: newCatName.trim() ? 'pointer' : 'not-allowed',
                      fontSize:'0.9rem', display:'flex',
                      alignItems:'center', justifyContent:'center', gap:8
                    }}
                  >
                    <FiPlus /> Create Category
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Page Header ═════════════════════════════════════════════ */}
      <div className="categories-header-section mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="header-meta">
            <h1 className="display-6 font-manrope font-extrabold text-navy mb-1">Document Categories</h1>
            <p className="text-secondary font-medium m-0">Organize and manage your document library folders</p>
          </div>
          <div className="header-actions d-flex gap-3">
            <button
              className="btn btn-navy-custom d-flex align-items-center gap-2 px-4 shadow-sm"
              onClick={() => setIsNewCatOpen(true)}
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

      {/* ═══ Control Bar ═════════════════════════════════════════════ */}
      <div className="categories-control-bar card-enterprise p-3 mb-5">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-4">
            <div className="search-pill-box">
              <FiSearch className="search-pill-icon" />
              <input
                type="text"
                placeholder="Search categories..."
                className="search-pill-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Workspace + Sort */}
          <div className="col-12 col-md-8">
            <div className="d-flex align-items-center justify-content-md-end gap-3 flex-wrap">
              <div className="sort-control d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
                <span className="small font-bold text-secondary text-uppercase">Workspace:</span>
                <select
                  className="form-select-custom border-0 bg-transparent fw-semibold"
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                >
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sort-control d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
                <FiFilter className="text-secondary" />
                <span className="small font-bold text-secondary text-uppercase">Sort:</span>
                <select
                  className="form-select-custom"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="name">Category Name</option>
                  <option value="count">File Count</option>
                </select>
                <button className="btn-sort-toggle" onClick={toggleSort}>
                  {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Category Grid ═══════════════════════════════════════════ */}
      {loading ? (
        <div className="categories-premium-grid">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="category-skeleton-card animate-pulse" />
          ))}
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="categories-premium-grid">
          {filteredAndSorted.map((cat, idx) => {
            const stat     = categories.find(c => c._id === cat.name);
            const docCount = stat ? stat.count : 0;
            return (
              <div
                key={cat.id}
                className="category-premium-card"
                style={{ '--delay': `${idx * 0.05}s` }}
              >
                <div className="card-inner">
                  <div className="card-head">
                    <div className="icon-box"><FiFolder /></div>
                    <button className="btn-more-options"><FiMoreVertical /></button>
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
            message={`No categories match "${searchQuery}". Try a different search or click "+ New Category".`}
          />
        </div>
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default Categories;
