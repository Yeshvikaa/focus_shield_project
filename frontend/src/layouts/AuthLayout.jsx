import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center relative p-6">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandPurple/10 rounded-full blur-3xl pulse-glow -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brandCyan/10 rounded-full blur-3xl pulse-glow -z-10" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brandBlue/10 text-brandCyan rounded-xl border border-brandCyan/20 shadow-glass-cyan mb-3">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-brandBlue via-brandCyan to-brandPurple bg-clip-text text-transparent">
            FOCUS SHIELD
          </h1>
          <p className="text-xs text-white/40 tracking-wider font-semibold mt-1">
            Focus Better. Learn Smarter.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
