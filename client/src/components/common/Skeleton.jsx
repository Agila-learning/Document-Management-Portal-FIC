import React from 'react';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
  const style = {
    width: width || '100%',
    height: height || '20px',
    borderRadius: borderRadius || '4px',
  };

  return <div className={`bg-slate-200 animate-pulse ${className}`} style={style} />;
};

export const StatCardSkeleton = () => (
  <div className="bg-white border border-brand-border rounded-xl p-6 shadow-enterprise space-y-4">
    <Skeleton width="48px" height="48px" borderRadius="12px" />
    <div className="space-y-2">
      <Skeleton width="60%" height="10px" />
      <Skeleton width="40%" height="24px" />
    </div>
  </div>
);

export const ActivityItemSkeleton = () => (
  <div className="flex items-center gap-4 p-3">
    <Skeleton width="40px" height="40px" borderRadius="10px" />
    <div className="flex-1 space-y-2">
      <Skeleton width="80%" height="12px" />
      <Skeleton width="40%" height="8px" />
    </div>
  </div>
);

export default Skeleton;
