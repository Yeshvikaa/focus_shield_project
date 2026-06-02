import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { User, Copy, Check, Shield, Flame, Award, Zap } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-1');
  const [statusMsg, setStatusMsg] = useState('');

  const handleCopyCode = () => {
    if (!user?.parentCode) return;
    navigator.clipboard.writeText(user.parentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateAvatar = async (seed) => {
    setSelectedAvatar(seed);
    setIsUpdating(true);
    setStatusMsg('');
    try {
      await api.put('/student/profile', { avatar: seed });
      await refreshUser();
      setStatusMsg('Profile avatar updated successfully!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to update avatar.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Your Profile Settings</h2>
        <p className="text-xs text-white/50 mt-1">Configure profile details and copy your linking codes.</p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-brandCyan/15 border border-brandCyan/20 text-xs text-brandCyan text-center">
          {statusMsg}
        </div>
      )}

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Left */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-4">
          <img 
            src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user?.avatar || 'avatar-1'}`}
            alt="User profile Bot"
            className="w-24 h-24 bg-slate-950 rounded-2xl border border-white/10 p-3 shadow-glass-cyan"
          />

          <div>
            <h3 className="font-extrabold text-white text-lg">{user?.name}</h3>
            <span className="text-xs text-white/40 font-semibold uppercase">{user?.role}</span>
          </div>

          <div className="flex gap-4 w-full justify-center pt-2 border-t border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-white/40 block font-bold uppercase">Level</span>
              <span className="text-base font-extrabold text-white">{user?.level}</span>
            </div>
            <div className="w-[1px] bg-white/10"></div>
            <div className="text-center">
              <span className="text-[10px] text-white/40 block font-bold uppercase">Streak</span>
              <span className="text-base font-extrabold text-orange-400 flex items-center gap-0.5 justify-center">
                <Flame size={14} className="fill-orange-400" />
                {user?.streak}d
              </span>
            </div>
            <div className="w-[1px] bg-white/10"></div>
            <div className="text-center">
              <span className="text-[10px] text-white/40 block font-bold uppercase">XP Point</span>
              <span className="text-base font-extrabold text-brandCyan">{user?.xp}</span>
            </div>
          </div>
        </div>

        {/* Profile Actions Right */}
        <div className="md:col-span-2 space-y-6">
          {/* Parent Code block (Students Only) */}
          {user?.role === 'student' && (
            <div className="glass-panel p-6 rounded-2xl border border-brandCyan/20 shadow-glass-cyan relative overflow-hidden space-y-3">
              <h4 className="font-extrabold text-white text-sm">Parent Linking Protocol</h4>
              <p className="text-xs text-white/60 leading-normal">
                Share this unique parameters key with your parent. They will input it on their Focus Shield dashboard to start tracking logs and reports.
              </p>
              
              <div className="flex gap-2 items-center max-w-sm mt-4">
                <div className="flex-1 bg-slate-950 p-3.5 rounded-xl border border-white/5 font-mono text-base font-bold text-center tracking-widest text-brandCyan select-all">
                  {user.parentCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3.5 bg-brandCyan/10 border border-brandCyan/20 text-brandCyan hover:bg-brandCyan hover:text-slate-950 rounded-xl transition-all"
                  title="Copy Code"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Unlocked Avatars select grid */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="font-extrabold text-white text-sm">Select Active Avatar</h4>
            <p className="text-xs text-white/40">Select from your inventory of unlocked custom profile bots.</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {user?.unlockedAvatars?.map((seed) => (
                <div
                  key={seed}
                  onClick={() => handleUpdateAvatar(seed)}
                  className={`p-1 bg-slate-950 rounded-xl border cursor-pointer transition-all ${
                    user.avatar === seed
                      ? 'border-brandCyan shadow-glass-cyan scale-105'
                      : 'border-white/5 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}`}
                    alt="Bot preset selection"
                    className="w-12 h-12"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
