import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw } from 'lucide-react';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-darkBg text-brandText">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-brandBlue/10 rounded-full blur-3xl pulse-glow -z-10"></div>
      
      <div className="max-w-md w-full text-center glass-panel p-8 rounded-2xl border border-white/5 shadow-2xl">
        <div className="inline-flex p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 mb-6 shadow-lg shadow-red-500/5">
          <ShieldAlert size={48} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">404 - Shield Compromised</h1>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          The coordinate grid you requested is unavailable or has been blocked by the Focus Shield protection protocols.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all border border-white/5"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-bold text-sm transition-all shadow-glass-cyan hover:opacity-90"
          >
            <RefreshCw size={16} />
            Reboot Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
