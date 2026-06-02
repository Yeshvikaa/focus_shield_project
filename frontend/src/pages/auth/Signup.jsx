import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { User, Mail, Lock, Sparkles } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read role from query param, default to student
  const queryRole = new URLSearchParams(location.search).get('role') || 'student';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: queryRole,
    avatar: 'avatar-1'
  });
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar presets list (Dicebear seeds)
  const avatars = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSelectAvatar = (seed) => {
    setFormData({ ...formData, avatar: seed });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, avatar } = formData;

    if (!name || !email || !password || !confirmPassword) {
      return setFormError('All fields are required.');
    }

    if (password !== confirmPassword) {
      return setFormError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setFormError('Password must be at least 6 characters.');
    }

    setIsSubmitting(true);
    try {
      await signup(name, email, password, role, avatar);
      // Redirect based on role
      navigate(`/${role}`);
    } catch (err) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white capitalize">Create {formData.role} Profile</h2>
        <p className="text-xs text-white/50 mt-1">Please enter your credentials below.</p>
      </div>

      {formError && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector in case they want to toggle */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl border border-white/5 text-xs text-center text-white/60 mb-2">
          {['student', 'teacher', 'parent'].map((roleType) => (
            <button
              key={roleType}
              type="button"
              onClick={() => setFormData({ ...formData, role: roleType })}
              className={`py-1.5 rounded-lg font-bold capitalize transition-all ${
                formData.role === roleType
                  ? 'bg-brandBlue text-slate-950 shadow-md font-extrabold'
                  : 'hover:text-white'
              }`}
            >
              {roleType}
            </button>
          ))}
        </div>

        {/* Avatar Select Widget */}
        <div className="mb-4">
          <label className="text-xs text-white/40 block mb-2 font-bold">Select Interface Avatar</label>
          <div className="flex gap-2 justify-center py-1">
            {avatars.map((seed) => (
              <img
                key={seed}
                src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}`}
                alt="bottts avatar"
                onClick={() => handleSelectAvatar(seed)}
                className={`w-9 h-9 rounded-lg cursor-pointer bg-slate-900 border transition-all ${
                  formData.avatar === seed
                    ? 'border-brandCyan scale-110 shadow-glass-cyan bg-brandCyan/10'
                    : 'border-white/10 hover:border-white/35'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Name input */}
        <div className="relative">
          <User className="absolute left-4 top-3.5 text-white/30" size={16} />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
          />
        </div>

        {/* Email input */}
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-white/30" size={16} />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
          />
        </div>

        {/* Password input */}
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-white/30" size={16} />
          <input
            type="password"
            name="password"
            placeholder="Security Code (Password)"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
          />
        </div>

        {/* Confirm Password input */}
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-white/30" size={16} />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter Security Code"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/30"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl shadow-glass-cyan hover:opacity-90 transition-all flex items-center justify-center gap-2 text-xs"
        >
          <Sparkles size={16} />
          {isSubmitting ? 'INITIALIZING SHIELD...' : 'AUTHORIZE ACCOUNT'}
        </button>
      </form>

      <div className="text-center mt-6">
        <span className="text-xs text-white/40">Already registered? </span>
        <button
          onClick={() => navigate('/login')}
          className="text-xs font-bold text-brandCyan hover:underline"
        >
          Sign In
        </button>
      </div>
    </AuthLayout>
  );
};

export default Signup;
