import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import api from '../../utils/api.js';
import { Mail, ShieldCheck, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [simulatedCode, setSimulatedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return setErrorMessage('Email is required.');

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setSimulatedCode(res.data.resetCode);
      setStatusMessage('Simulated verification code generated!');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Email not found.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!inputCode || !newPassword || !confirmPassword) {
      return setErrorMessage('Please fill in all inputs.');
    }

    if (inputCode !== simulatedCode) {
      return setErrorMessage('Invalid verification code.');
    }

    if (newPassword !== confirmPassword) {
      return setErrorMessage('Passwords do not match.');
    }

    if (newPassword.length < 6) {
      return setErrorMessage('Password must be at least 6 characters.');
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.post('/api/auth/reset-password', { email, password: newPassword });
      setStatusMessage('Password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white">Reset Credentials</h2>
        <p className="text-xs text-white/50 mt-1">Recover your security login passcode.</p>
      </div>

      {statusMessage && (
        <div className="p-3 mb-4 rounded-xl bg-brandCyan/10 border border-brandCyan/20 text-xs text-brandCyan text-center">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
          {errorMessage}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <p className="text-xs text-white/60 leading-relaxed mb-2">
            Enter your registered email address and we will generate a secure reset sequence.
          </p>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-white/30" size={16} />
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl shadow-glass-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 text-xs"
          >
            {isSubmitting ? 'GENERATING CODE...' : 'GENERATE RECOVERY SEQUENCE'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {/* Debug/Simulated display of verification token */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-white/5 text-center mb-2 shadow-inner">
            <span className="text-[10px] text-white/40 block uppercase tracking-wider mb-1 font-bold">Simulated Reset Code</span>
            <span className="text-xl font-extrabold text-brandCyan tracking-widest">{simulatedCode}</span>
          </div>

          <div className="relative">
            <ShieldCheck className="absolute left-4 top-3.5 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Enter Reset Code"
              value={inputCode}
              onChange={(e) => { setInputCode(e.target.value); setErrorMessage(''); }}
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-4 top-3.5 text-white/30" size={16} />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(''); }}
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
            />
          </div>

          <div className="relative">
            <KeyRound className="absolute left-4 top-3.5 text-white/30" size={16} />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(''); }}
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl shadow-glass-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 text-xs"
          >
            {isSubmitting ? 'RECONFIGURING KEY...' : 'APPLY NEW PASSWORD'}
          </button>
        </form>
      )}

      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/login')}
          className="text-xs font-bold text-brandCyan hover:underline"
        >
          Return to Sign In
        </button>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
