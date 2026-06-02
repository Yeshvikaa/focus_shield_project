import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      return setFormError('Please fill in all security fields.');
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      // Route user according to role
      navigate(`/${loggedUser.role}`);
    } catch (err) {
      setFormError(err.message || 'Verification failed. Incorrect email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white">Security Credentials</h2>
        <p className="text-xs text-white/50 mt-1">Authenticate access to focus shields.</p>
      </div>

      {formError && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-white/30" size={16} />
          <input
            type="email"
            name="email"
            placeholder="Security Identifier (Email)"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-white/30" size={16} />
          <input
            type="password"
            name="password"
            placeholder="Authorization Code (Password)"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs text-white/40 hover:text-brandCyan hover:underline transition-colors"
          >
            Forgot Authorization Code?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl shadow-glass-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <LogIn size={16} />
          {isSubmitting ? 'VALIDATING KEY...' : 'SYNC DASHBOARD'}
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-xs text-white/40">New to the platform? </span>
        <button
          onClick={() => navigate('/select-role')}
          className="text-xs font-bold text-brandCyan hover:underline"
        >
          Select Access Level
        </button>
      </div>
    </AuthLayout>
  );
};

export default Login;
