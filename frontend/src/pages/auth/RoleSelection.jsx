import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Shield, BookOpen, User, Users } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white">Select Your Authorization Level</h2>
        <p className="text-xs text-white/50 mt-1">Choose the protocol that fits your requirements.</p>
      </div>

      <div className="space-y-4">
        {/* Student Option */}
        <div 
          onClick={() => handleSelectRole('student')}
          className="flex items-center gap-4 p-4 rounded-xl glass-panel hover:border-brandCyan/40 hover:shadow-glass-cyan cursor-pointer transition-all border border-white/5 group"
        >
          <div className="p-3 bg-brandCyan/10 text-brandCyan rounded-lg border border-brandCyan/20 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Student Access</h3>
            <p className="text-[11px] text-white/40 mt-0.5">Study PDFs, complete MCQ quizzes, and track focus streaks.</p>
          </div>
        </div>

        {/* Teacher Option */}
        <div 
          onClick={() => handleSelectRole('teacher')}
          className="flex items-center gap-4 p-4 rounded-xl glass-panel hover:border-brandBlue/40 hover:shadow-glass-blue cursor-pointer transition-all border border-white/5 group"
        >
          <div className="p-3 bg-brandBlue/10 text-brandBlue rounded-lg border border-brandBlue/20 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Teacher Access</h3>
            <p className="text-[11px] text-white/40 mt-0.5">Publish assignments, generate quizzes, and view class metrics.</p>
          </div>
        </div>

        {/* Parent Option */}
        <div 
          onClick={() => handleSelectRole('parent')}
          className="flex items-center gap-4 p-4 rounded-xl glass-panel hover:border-brandPurple/40 hover:shadow-glass-purple cursor-pointer transition-all border border-white/5 group"
        >
          <div className="p-3 bg-brandPurple/10 text-brandPurple rounded-lg border border-brandPurple/20 group-hover:scale-110 transition-transform">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Parent Access</h3>
            <p className="text-[11px] text-white/40 mt-0.5">Monitor child focus times, review scores, and track distraction logs.</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <span className="text-xs text-white/40">Already have an account? </span>
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

export default RoleSelection;
