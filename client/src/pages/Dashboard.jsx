import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, FiClock, FiAlertTriangle, FiHardDrive, 
  FiActivity, FiArrowRight, FiPlus, FiCheckCircle 
} from 'react-icons/fi';
import api from '../utils/api';
import EmptyState from '../components/common/EmptyState';
import { StatCardSkeleton, ActivityItemSkeleton } from '../components/common/Skeleton';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/stats/dashboard'),
          api.get('/activity/recent')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setTimeout(() => setLoading(false), 500); 
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      label: 'Total Documents', 
      value: stats?.totalDocuments || 0, 
      icon: <FiFileText />, 
      theme: 'blue'
    },
    { 
      label: 'Recently Uploaded', 
      value: stats?.recentUploads || 0, 
      icon: <FiClock />, 
      theme: 'sky'
    },
    { 
      label: 'Expiring Soon', 
      value: stats?.expiringSoon || 0, 
      icon: <FiAlertTriangle />, 
      theme: 'amber'
    },
    { 
      label: 'Storage Usage', 
      value: stats ? `${((stats?.storageUsed || 0) / 1024 / 1024).toFixed(1)} MB` : '0 MB', 
      subValue: `of ${((stats?.storageLimit || 10 * 1024 * 1024 * 1024) / 1024 / 1024 / 1024).toFixed(0)} GB`,
      icon: <FiHardDrive />, 
      theme: 'indigo'
    },
  ];

  return (
    <div className="dashboard-wrapper animate-fade">
      {/* Page Header */}
      <div className="dashboard-hero mb-5">
        <div className="hero-icon">
          <FiActivity />
        </div>
        <div className="hero-text">
          <h1 className="hero-title">Nexus Control Center</h1>
          <p className="hero-subtitle">Unified management for Forge India Connect personnel and records</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-5">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div className="col-12 col-md-6 col-lg-3" key={i}>
              <StatCardSkeleton />
            </div>
          ))
        ) : (
          statCards.map((stat, index) => (
            <div className="col-12 col-md-6 col-lg-3" key={index}>
              <div className="stat-card">
                <div className="stat-card-row">
                  <div className={`stat-icon-box theme-${stat.theme}`}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">{stat.label}</span>
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="stat-value">{stat.value}</span>
                      {stat.subValue && <span className="stat-subvalue">{stat.subValue}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="row g-4 mb-5">
        {/* Recent Activity */}
        <div className="col-12 col-lg-8">
          <section className="activity-panel h-100">
            <div className="panel-header-custom">
              <h2 className="panel-title">System Activity Log</h2>
              <button 
                className="btn-view-all"
                onClick={() => navigate('/activity')}
              >
                Historical Logs <FiArrowRight />
              </button>
            </div>
            
            <div className="activity-feed">
              {loading ? (
                [...Array(5)].map((_, i) => <ActivityItemSkeleton key={i} />)
              ) : activity.length > 0 ? (
                activity.map((log) => (
                  <div key={log._id} className="activity-feed-item">
                    <div className="feed-icon">
                      {log.action === 'UPLOAD' ? <FiPlus /> : <FiActivity />}
                    </div>
                    <div className="feed-content">
                      <div className="feed-text">{log.details}</div>
                      <div className="feed-meta">
                        <span className="meta-user">{log.user?.username}</span>
                        <span className="meta-dot" />
                        <span className="meta-time">{new Date(log.createdAt).toLocaleTimeString()} • {new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState 
                  icon={<FiActivity />} 
                  title="Logs Synchronized" 
                  message="No recent system events detected. Activity will populate as users interact with the portal."
                />
              )}
            </div>
          </section>
        </div>

        {/* Alerts & Storage */}
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Critical Alerts */}
            <section className="alerts-section card-enterprise">
              <div className="section-header d-flex align-items-center justify-content-between mb-4">
                <h2 className="h6 font-extrabold m-0">Critical Alerts</h2>
                <span className="badge rounded-pill bg-danger-light text-danger px-2 py-1">
                  {stats?.expiringSoon || 0}
                </span>
              </div>
              
              <div className="alerts-content">
                {loading ? (
                  <div className="skeleton-alert mb-3" />
                ) : stats?.expiringSoon > 0 ? (
                  <div className="alert-box theme-warning">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <FiAlertTriangle className="alert-icon" />
                      <span className="alert-title">Document Expiry Warning</span>
                    </div>
                    <p className="alert-text">
                      There are {stats.expiringSoon} documents approaching their expiration date. We recommend immediate review.
                    </p>
                    <button 
                      className="btn btn-warning-custom w-100"
                      onClick={() => navigate('/alerts')}
                    >
                      Review Files
                    </button>
                  </div>
                ) : (
                  <EmptyState 
                    icon={<FiCheckCircle />} 
                    title="System Compliant" 
                    message="No urgent alerts found."
                  />
                )}
              </div>
            </section>

            {/* Storage Usage */}
            <section className="storage-section card-enterprise">
              <h2 className="h6 font-extrabold mb-4">Cloud Storage</h2>
              <div className="storage-analytics">
                <div className="d-flex justify-content-between mb-2">
                  <span className="analytics-label">Aggregate Usage</span>
                  <span className="analytics-value text-primary">
                    {loading ? '...' : (((stats?.storageUsed || 0) / (stats?.storageLimit || 10 * 1024 * 1024 * 1024)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-custom mb-3">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${loading ? 0 : ((stats?.storageUsed || 0) / (stats?.storageLimit || 10 * 1024 * 1024 * 1024)) * 100}%` }}
                  ></div>
                </div>
                <div className="analytics-foot">
                  Using {loading ? '...' : ((stats?.storageUsed || 0) / 1024 / 1024).toFixed(1)} MB of {((stats?.storageLimit || 10 * 1024 * 1024 * 1024) / 1024 / 1024 / 1024).toFixed(0)} GB
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
