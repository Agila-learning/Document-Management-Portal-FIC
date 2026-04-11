import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, FiBell, FiShield, FiMoon, FiSun, FiCheck, 
  FiHardDrive, FiActivity, FiKey, FiMail 
} from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');
  const [success, setSuccess] = useState(false);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <FiUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'security', label: 'Security & Access', icon: <FiShield /> },
    { id: 'appearance', label: 'Platform Appearance', icon: <FiSun /> },
  ];

  return (
    <div className="settings-wrapper">
      {/* Header */}
      <div className="mb-5">
        <h1 className="h2 mb-1">System Settings</h1>
        <p className="text-secondary font-medium m-0">Manage your account credentials, security preferences, and portal configuration</p>
      </div>

      <div className="row g-4">
        {/* Settings Sidebar */}
        <div className="col-12 col-lg-3">
          <aside className="settings-nav card-enterprise p-2">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="btn-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="storage-telemetry mt-4 p-4 rounded-xl border border-primary-100">
              <div className="d-flex align-items-center gap-2 mb-3 telemetry-title text-primary">
                <FiHardDrive />
                <span>Enterprise Storage</span>
              </div>
              <div className="telemetry-bar-wrap mb-2">
                <div className="telemetry-bar-fill" style={{ width: '32%' }}></div>
              </div>
              <div className="telemetry-info">
                Using 3.2 GB of 10 GB available storage
              </div>
            </div>
          </aside>
        </div>

        {/* Settings Content */}
        <div className="col-12 col-lg-9">
          <main className="settings-main-card card-enterprise p-4 p-md-5 h-100">
            {activeTab === 'profile' && (
              <div className="settings-section animate-fade">
                <div className="profile-header d-flex align-items-center gap-4 pb-5 border-bottom mb-5">
                  <div className="profile-avatar-circle">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="profile-info-block">
                    <h2 className="h4 font-extrabold mb-1">{user?.username}</h2>
                    <div className="d-flex align-items-center gap-3">
                      <span className="role-tag">{user?.role}</span>
                      <span className="org-label text-muted small font-bold">Forge India Connect IT Staff</span>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-12 col-md-6">
                    <div className="form-group-custom">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.username}
                        className="form-control-custom w-100"
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="form-group-custom">
                      <label>Work Email</label>
                      <div className="input-with-icon">
                        <FiMail className="icon-field" />
                        <input 
                          type="email" 
                          defaultValue={user?.email || 'admin@forgeindiaconnect.com'} 
                          readOnly
                          className="form-control-custom w-100 disabled-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary-custom d-flex align-items-center gap-2 px-4 py-2"
                  onClick={handleSave}
                >
                  {success ? <><FiCheck /> Saved Preferences</> : 'Update Profile'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section animate-fade">
                <div className="mb-5">
                  <h2 className="h4 font-extrabold mb-1">Authentication Security</h2>
                  <p className="text-secondary small font-medium">Ensure your account remains safe using a strong, unique password</p>
                </div>

                <div className="max-w-sm">
                  <div className="form-group-custom mb-4">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="form-control-custom w-100"
                    />
                  </div>
                  <div className="form-group-custom mb-4">
                    <label>New Secure Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="form-control-custom w-100"
                    />
                  </div>
                  <button 
                    className="btn btn-navy-custom w-100 py-2 mt-2"
                    onClick={handleSave}
                  >
                    Update Portal Credentials
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section animate-fade">
                <div className="mb-5">
                  <h2 className="h4 font-extrabold mb-1">Alert Preferences</h2>
                  <p className="text-secondary small font-medium">Configure how and when you receive critical system updates</p>
                </div>

                <div className="notification-options space-y-3">
                  <div className="notif-toggle-row d-flex align-items-center justify-content-between p-3 border rounded-lg">
                    <div className="notif-text">
                      <div className="font-bold text-navy small">Document Expiry Emails</div>
                      <div className="text-muted extra-small font-black uppercase tracking-widest mt-1">30 Days Advance Notice</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>

                  <div className="notif-toggle-row d-flex align-items-center justify-content-between p-3 border rounded-lg mt-3">
                    <div className="notif-text">
                      <div className="font-bold text-navy small">Upload Confirmation</div>
                      <div className="text-muted extra-small font-black uppercase tracking-widest mt-1">Real-time Push Notifications</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section animate-fade">
                <div className="mb-5">
                  <h2 className="h4 font-extrabold mb-1">Visual Preferences</h2>
                  <p className="text-secondary small font-medium">Customize your workspace for maximum comfort and productivity</p>
                </div>

                <div className="appearance-card d-flex align-items-center justify-content-between p-4 border rounded-xl bg-light">
                  <div className="d-flex align-items-center gap-4">
                    <div className="appearance-icon-box bg-white card-enterprise d-flex align-items-center justify-content-center">
                      {isDarkMode ? <FiMoon /> : <FiSun />}
                    </div>
                    <div>
                      <h3 className="h6 font-extrabold m-0 text-navy">Dark Mode Strategy</h3>
                      <p className="small text-muted m-0 font-medium">Toggle between high-contrast light and low-light themes</p>
                    </div>
                  </div>
                  <div className="form-check form-switch fs-4">
                    <input 
                      className="form-check-input pointer-cursor" 
                      type="checkbox" 
                      checked={isDarkMode}
                      onChange={toggleTheme}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
