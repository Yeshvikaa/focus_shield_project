import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Settings, Shield, Bell, Volume2, ShieldCheck, UserCheck } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  
  // Local settings options saved in state
  const [settings, setSettings] = useState({
    audioWarnings: localStorage.getItem('cfg_audio') !== 'false',
    parentReports: localStorage.getItem('cfg_parent') !== 'false',
    visualNotifications: localStorage.getItem('cfg_notif') !== 'false',
    strictFocusMode: localStorage.getItem('cfg_strict') === 'true'
  });

  const [savedMsg, setSavedMsg] = useState('');

  const handleToggle = (key) => {
    const newVal = !settings[key];
    setSettings({ ...settings, [key]: newVal });
    localStorage.setItem(`cfg_${key.replace(/([A-Z])/g, "_$1").toLowerCase().split('_')[0]}`, newVal.toString());
    
    setSavedMsg('Parameters successfully updated!');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">System Settings</h2>
        <p className="text-xs text-white/50 mt-1">Adjust notification alarms, shield properties, and view active configuration modules.</p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-brandCyan/15 border border-brandCyan/20 text-[11px] text-brandCyan text-center">
          {savedMsg}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module parameters info */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="p-3.5 bg-brandBlue/10 text-brandBlue rounded-xl border border-brandBlue/20 w-fit">
            <Settings size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Configuration Module</h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              Enable auditory alarms and parent alert relays. Configure focus properties to customize your shield sandbox.
            </p>
          </div>
        </div>

        {/* Toggle options List */}
        <div className="md:col-span-2 space-y-4">
          {/* Audio warnings */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <Volume2 className="text-brandCyan shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-white text-xs">Auditory Violation Tone</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Synthesize alert tones when browser window shifts during study blocks.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('audioWarnings')}
              className={`w-11 h-6 rounded-full p-1 transition-colors outline-none shrink-0 ${
                settings.audioWarnings ? 'bg-brandCyan' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                settings.audioWarnings ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Parents syncing */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <UserCheck className="text-brandBlue shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-white text-xs">Parent Monitoring Sync</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Relay distraction alerts and quiz scoring indices directly to linked parents.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('parentReports')}
              className={`w-11 h-6 rounded-full p-1 transition-colors outline-none shrink-0 ${
                settings.parentReports ? 'bg-brandCyan' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                settings.parentReports ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Visual alerts */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <Bell className="text-brandPurple shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-white text-xs">Visual Notifications</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Pop up system alert boxes for milestones and streak warning logs.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('visualNotifications')}
              className={`w-11 h-6 rounded-full p-1 transition-colors outline-none shrink-0 ${
                settings.visualNotifications ? 'bg-brandCyan' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                settings.visualNotifications ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Strict mode */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <Shield className="text-yellow-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-white text-xs">Maximized View Lock</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Strictly lock screen navigation and ignore escape codes in active focus mode.</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('strictFocusMode')}
              className={`w-11 h-6 rounded-full p-1 transition-colors outline-none shrink-0 ${
                settings.strictFocusMode ? 'bg-brandCyan' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                settings.strictFocusMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
