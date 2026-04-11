import React, { useState, useEffect } from 'react';
import { FiBell, FiClock, FiSettings, FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        try {
          const { data } = await api.get('/activity/recent');
          // For now, mapping activity logs as notifications
          setNotifications(data.slice(0, 5));
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown animate-fade">
      <div className="notif-header">
        <h3>Notifications</h3>
        <button className="btn-mark-all"><FiCheck /> Mark all read</button>
      </div>
      
      <div className="notif-list">
        {loading ? (
          <div className="notif-loading">Loading alerts...</div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif._id} className="notif-item">
              <div className={`notif-icon ${notif.action.toLowerCase()}`}>
                <FiBell />
              </div>
              <div className="notif-content">
                <p className="notif-text">{notif.details}</p>
                <span className="notif-time"><FiClock /> {new Date(notif.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="notif-empty">No new notifications</div>
        )}
      </div>
      
      <div className="notif-footer">
        <button className="btn-view-all">View all activity</button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
