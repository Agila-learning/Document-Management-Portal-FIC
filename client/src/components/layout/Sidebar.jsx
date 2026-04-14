import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiFileText, FiFolder, FiUsers, FiAlertCircle, 
  FiArchive, FiTrash2, FiSettings, FiLogOut, FiX 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Overview', icon: FiHome, path: '/' },
    { label: 'Documents', icon: FiFileText, path: '/documents' },
    { label: 'Categories', icon: FiFolder, path: '/categories' },
    { label: 'Candidates', icon: FiUsers, path: '/candidates' },
    { label: 'Alerts', icon: FiAlertCircle, path: '/alerts' },
    { label: 'Archive', icon: FiArchive, path: '/archive' },
    { label: 'Trash', icon: FiTrash2, path: '/trash' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (window.innerWidth < 992) onClose();
  };

  return (
    <aside className={`sidebar-main ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <img src="/assets/Updated-Logo.jpeg" alt="FIC Logo" className="brand-logo-img" />
          <div className="brand-text-block">
            <h1 className="brand-title">Forge India</h1>
            <span className="brand-subtitle">Connect</span>
          </div>
        </div>
        <button className="btn-close-sidebar d-lg-none" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <nav className="sidebar-content">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            onClick={() => window.innerWidth < 992 && onClose()}
          >
            <item.icon className="link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="side-link logout-link w-100 border-0 bg-transparent"
          onClick={handleLogout}
        >
          <FiLogOut className="link-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
