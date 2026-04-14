import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UploadModal from '../documents/UploadModal';
import FICQuippy from '../common/FICQuippy';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleUploadModal = () => setIsUploadModalOpen(!isUploadModalOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="layout-wrapper d-flex min-vh-100 w-100">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main viewport */}
      <div className="main-viewport flex-grow-1 d-flex flex-column min-vh-100">
        <Navbar 
          onUploadClick={toggleUploadModal} 
          onMenuClick={toggleSidebar}
        />
        <main className="main-content container-fluid p-4 p-md-5 animate-fade">
          <div className="content-inner mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={toggleUploadModal} 
        onUploadSuccess={() => window.location.reload()}
      />
      
      <FICQuippy />
    </div>
  );
};

export default DashboardLayout;
