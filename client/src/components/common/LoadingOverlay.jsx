import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md animate-fade">
      <div className="relative">
        {/* Main Spinner */}
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin shadow-xl"></div>
        {/* Glow Element */}
        <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full animate-pulse"></div>
      </div>
      <p className="mt-8 text-navy font-manrope font-extrabold text-lg tracking-tight animate-pulse">
        Loading Portal Data...
      </p>
      <div className="mt-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
        Forge India Connect
      </div>
    </div>
  );
};

export default LoadingOverlay;
