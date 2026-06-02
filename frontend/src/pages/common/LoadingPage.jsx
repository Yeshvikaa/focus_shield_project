import React from 'react';

const LoadingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-brandText">
      <div className="relative flex items-center justify-center">
        {/* Glowing loader circle */}
        <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-brandCyan animate-spin"></div>
        <div className="absolute w-12 h-12 rounded-full border-b-2 border-l-2 border-brandPurple animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute w-6 h-6 rounded-full bg-brandBlue/35 blur-xs"></div>
      </div>
      <p className="mt-6 text-sm font-bold tracking-widest text-white/50 animate-pulse">
        SHIELDING DISTRACTIONS...
      </p>
    </div>
  );
};

export default LoadingPage;
