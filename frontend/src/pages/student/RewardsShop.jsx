import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import { Award, Zap, ShieldAlert, Sparkles, Check, Lock } from 'lucide-react';

const RewardsShop = () => {
  const { user, refreshUser } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preset Avatar items
  const shopAvatars = [
    { key: 'avatar-1', label: 'Shield Standard', cost: 0, desc: 'Initial registration layout' },
    { key: 'avatar-2', label: 'Cyber Bot v2', cost: 40, desc: 'Optimized node compiler' },
    { key: 'avatar-3', label: 'Glitch Runner', cost: 80, desc: 'Distortion shield frame' },
    { key: 'avatar-4', label: 'Neon Phantom', cost: 120, desc: 'Maximized focus parameters' },
    { key: 'avatar-5', label: 'Archon Prime', cost: 200, desc: 'Ultra learning authority' }
  ];

  // Preset Custom Themes
  const shopThemes = [
    { key: 'cyberpunk', label: 'Synthwave Purple', cost: 0, desc: 'Default neon dark dashboard style' },
    { key: 'matrix', label: 'Terminal Green', cost: 100, desc: 'Retro matrix layout overrides' },
    { key: 'solaris', label: 'Solar Flares', cost: 150, desc: 'Deep orange glassmorphic elements' }
  ];

  // System Badge Definitions
  const badgeDefinitions = [
    { key: 'study_champion', label: 'Study Champion', desc: 'Successfully complete your first assignment quiz.', color: 'text-brandCyan border-brandCyan/20 bg-brandCyan/5' },
    { key: 'focus_master', label: 'Focus Master', desc: 'Focus for 10 consecutive minutes with 0 window distraction alerts.', color: 'text-brandPurple border-brandPurple/20 bg-brandPurple/5' },
    { key: 'gold_streak', label: 'Gold Streak', desc: 'Log consecutive active study days for 7 days running.', color: 'text-orange-400 border-orange-400/20 bg-orange-400/5' }
  ];

  const handlePurchase = async (type, itemKey, cost) => {
    if (purchasing) return;
    setPurchasing(true);
    setMessage('');
    setErrorMsg('');

    try {
      const res = await api.post('/api/student/shop/purchase', { type, itemKey, xpCost: cost });
      await refreshUser();
      setMessage(res.data.message || 'Unlock successful!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transaction failed.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Rewards Vault & Shop</h2>
          <p className="text-xs text-white/50 mt-1">Unlock badges, custom dashboard themes, and robot avatars using your study points.</p>
        </div>

        <div className="flex items-center gap-2 bg-brandCyan/10 border border-brandCyan/20 text-brandCyan px-4 py-2 rounded-xl text-sm font-bold shadow-inner shrink-0">
          <Zap size={16} className="fill-brandCyan" />
          <span>Balance: {user?.xp} XP</span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-brandCyan/15 border border-brandCyan/20 text-xs text-brandCyan text-center">
          {message}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
          {errorMsg}
        </div>
      )}

      {/* Badges Section */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white">Earned Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badgeDefinitions.map((badge) => {
            const hasBadge = user?.badges?.includes(badge.key);
            return (
              <div 
                key={badge.key}
                className={`glass-panel p-5 rounded-2xl border transition-all flex gap-4 items-start ${
                  hasBadge ? 'border-orange-500/20 opacity-100 shadow-md' : 'opacity-40 border-white/5'
                }`}
              >
                <div className={`p-3 rounded-xl border shrink-0 ${hasBadge ? badge.color : 'border-white/5 bg-white/5 text-white/40'}`}>
                  <Award size={24} className={hasBadge ? 'fill-orange-400/5' : ''} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{badge.label}</h4>
                  <p className="text-[11px] text-white/50 mt-1 leading-normal">{badge.desc}</p>
                  {hasBadge ? (
                    <span className="text-[9px] text-orange-400 font-extrabold block mt-2 uppercase tracking-wide">Earned & Active</span>
                  ) : (
                    <span className="text-[9px] text-white/30 block mt-2 uppercase tracking-wide flex items-center gap-1"><Lock size={10} /> Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Avatars Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-base font-extrabold text-white">Unlock robot Avatars</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {shopAvatars.map((av) => {
            const isUnlocked = user?.unlockedAvatars?.includes(av.key);
            const canAfford = (user?.xp || 0) >= av.cost;
            return (
              <div 
                key={av.key}
                className={`glass-panel p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isUnlocked ? 'border-brandCyan/20 shadow-sm' : 'border-white/5'
                }`}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${av.key}`}
                  alt={av.label}
                  className="w-14 h-14 bg-slate-950 rounded-xl border border-white/10 p-1.5 mb-3"
                />
                <h4 className="font-bold text-white text-xs block">{av.label}</h4>
                <p className="text-[10px] text-white/40 mt-1 h-8 leading-snug">{av.desc}</p>
                
                <div className="w-full mt-4">
                  {isUnlocked ? (
                    <div className="w-full py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-[10px] font-bold flex items-center justify-center gap-1">
                      <Check size={12} /> Unlocked
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford || purchasing}
                      onClick={() => handlePurchase('avatar', av.key, av.cost)}
                      className={`w-full py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                        canAfford 
                          ? 'bg-brandCyan hover:opacity-95 text-slate-950 shadow-glass-cyan font-black' 
                          : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Zap size={10} className="fill-current" />
                      Unlock ({av.cost} XP)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Themes Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-base font-extrabold text-white">Unlock Interface Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shopThemes.map((theme) => {
            const isUnlocked = user?.unlockedThemes?.includes(theme.key);
            const canAfford = (user?.xp || 0) >= theme.cost;
            return (
              <div 
                key={theme.key}
                className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked ? 'border-brandPurple/20' : 'border-white/5'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{theme.label}</h4>
                  <p className="text-xs text-white/50 mt-1 leading-normal">{theme.desc}</p>
                </div>
                
                <div className="mt-6">
                  {isUnlocked ? (
                    <div className="w-full py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-bold flex items-center justify-center gap-1">
                      <Check size={14} /> Theme Unlocked
                    </div>
                  ) : (
                    <button
                      disabled={!canAfford || purchasing}
                      onClick={() => handlePurchase('theme', theme.key, theme.cost)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        canAfford 
                          ? 'bg-gradient-to-r from-brandPurple to-brandBlue text-white font-extrabold shadow-glass-purple' 
                          : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Zap size={12} className="fill-current" />
                      Buy Custom Theme ({theme.cost} XP)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardsShop;
