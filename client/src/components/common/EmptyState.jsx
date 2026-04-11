import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon, title, message, actionText, onAction }) => {
  return (
    <div className="empty-state animate-fade">
      <div className="empty-icon-wrapper">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionText && (
        <button 
          className="btn btn-primary-custom px-4 py-2" 
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
