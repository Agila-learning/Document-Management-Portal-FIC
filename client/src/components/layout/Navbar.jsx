import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiPlus, FiMenu, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar = ({ onUploadClick, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen,   setNotifOpen]     = useState(false);
  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-custom">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="btn-menu d-lg-none" onClick={onMenuClick}>
            <FiMenu />
          </button>
          <div className="navbar-search d-none d-md-block">
            <FiSearch className="navbar-search-icon" />
            <input 
              type="text" 
              placeholder="Search documents, records..." 
              className="navbar-search-input"
            />
          </div>
        </div>

        <div className="navbar-right">
          <div className="nav-actions-group">
            <button 
              className="btn btn-primary-custom nav-quick-btn"
              onClick={onUploadClick}
            >
              <FiPlus />
              <span>Quick Upload</span>
            </button>

            <div className="nav-divider" />

            <div className="position-relative" ref={notifRef}>
              <button
                className={`btn-notification ${notifOpen ? 'active' : ''}`}
                onClick={() => setNotifOpen(prev => !prev)}
                title="Notifications"
              >
                <FiBell />
                <span className="notification-indicator" />
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="user-profile-section" ref={dropdownRef}>
            <button
              className={`profile-trigger ${profileOpen ? 'active' : ''}`}
              onClick={() => setProfileOpen(prev => !prev)}
            >
              <div className="user-text d-none d-lg-flex">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <div className="user-avatar-box">
                {user?.username?.charAt(0).toUpperCase()}
                <div className="avatar-status" />
              </div>
              <FiChevronDown className={`chevron-icon ${profileOpen ? 'rotated' : ''}`} />
            </button>

            {profileOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="header-avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="header-meta">
                    <span className="meta-name">{user?.username}</span>
                    <span className="meta-role">{user?.role}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-link"
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                >
                  <FiUser /> <span>My Profile</span>
                </button>
                <button
                  className="dropdown-link"
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                >
                  <FiSettings /> <span>Account Settings</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-link logout-link"
                  onClick={handleLogout}
                >
                  <FiLogOut /> <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
