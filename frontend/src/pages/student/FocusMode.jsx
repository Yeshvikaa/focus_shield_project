import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, ShieldAlert, Play, X, Zap, Award, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

const FocusMode = () => {
  const { refreshUser } = useAuth();
  const [duration, setDuration] = useState(300); // Planned seconds (default 5m)
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [distractions, setDistractions] = useState(0);
  
  // Modals state
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [completionData, setCompletionData] = useState(null);

  const countdownIntervalRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    // Sync active session ref to listeners
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    // Window distraction event listeners
    if (isActive && session) {
      window.addEventListener('blur', handleBlurDistraction);
      document.addEventListener('visibilitychange', handleVisibilityDistraction);
    }

    return () => {
      window.removeEventListener('blur', handleBlurDistraction);
      document.removeEventListener('visibilitychange', handleVisibilityDistraction);
      clearInterval(countdownIntervalRef.current);
    };
  }, [isActive, session]);

  // Synthesize warning alarm tone using Web Audio API (no external file dependencies)
  const playAlarmTone = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(320, audioCtx.currentTime); // Low warning frequency
      oscillator.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.4); // Drop frequency

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Web Audio playback failed:', e);
    }
  };

  const handleBlurDistraction = () => {
    registerDistraction('blur', 'Switched focus away from study viewport window.');
  };

  const handleVisibilityDistraction = () => {
    if (document.hidden) {
      registerDistraction('tab-switch', 'Switched browser tabs away from Study sandbox.');
    }
  };

  const registerDistraction = async (type, details) => {
    const activeSession = sessionRef.current;
    if (!activeSession) return;

    playAlarmTone();

    try {
      const res = await api.post(`/api/focus/${activeSession._id}/distraction`, { type, details });
      const updatedCount = res.data.session.distractionCount;
      const penaltyAction = res.data.penaltyAction;
      
      setDistractions(updatedCount);
      
      if (penaltyAction === 'warning') {
        setWarningMsg(`Focus Shield Warning: Window focus lost! Please stay focused. Warning Level: 1/3.`);
        setWarningOpen(true);
      } else if (penaltyAction === 'distracted_session_logged') {
        setWarningMsg(`Focus Shield Alert: Multi-distraction logged. Parent dashboard notified. Warning Level: 2/3.`);
        setWarningOpen(true);
      } else if (penaltyAction === 'restart_session') {
        // Restart Session
        setWarningMsg(`Focus Shield Breach! 3 warnings logged. Restarting study session countdown.`);
        setWarningOpen(true);
        setTimeLeft(duration); // reset clock
        setDistractions(0);
        
        // Fetch new starting session log
        const startRes = await api.post('/api/focus/start', { duration });
        setSession(startRes.data);
      }
    } catch (err) {
      console.error('Distraction logging failure:', err);
    }
  };

  const handleStartFocus = async () => {
    try {
      const res = await api.post('/api/focus/start', { duration });
      setSession(res.data);
      setTimeLeft(duration);
      setDistractions(0);
      setIsActive(true);
      setCompletionData(null);
      
      // Enter Fullscreen if browser supports it
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => console.log('Fullscreen rejected', err));
      }

      // Start countdown
      let time = duration;
      countdownIntervalRef.current = setInterval(async () => {
        time = Math.max(0, time - 1);
        setTimeLeft(time);

        if (time <= 0) {
          clearInterval(countdownIntervalRef.current);
          handleFinishFocus();
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to initiate focus session:', err);
    }
  };

  const handleFinishFocus = async () => {
    const activeSession = sessionRef.current;
    if (!activeSession) return;

    try {
      const res = await api.post(`/api/focus/${activeSession._id}/end`, { actualDuration: duration });
      setCompletionData(res.data);
      setIsActive(false);
      setSession(null);
      refreshUser();
      
      // Confetti burst on completion!
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });

      // Exit Fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    } catch (err) {
      console.error('End session submit failure:', err);
    }
  };

  const handleForceExit = () => {
    if (confirm('Cancel focus session? You will forfeit XP rewards.')) {
      clearInterval(countdownIntervalRef.current);
      setIsActive(false);
      setSession(null);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    }
  };

  // Format seconds into minutes:seconds
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-white">Focus shield Mode</h2>
        <p className="text-xs text-white/50 mt-1">
          Lock down your workspace viewport. Window blurs or tab-switches trigger alarm warnings and log parent metrics.
        </p>
      </div>

      {/* Warning Alert Modal */}
      {warningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkBg/80 backdrop-blur-md p-6">
          <div className="max-w-md w-full glass-panel border border-red-500/20 shadow-2xl p-8 rounded-2xl text-center space-y-4 animate-bounce">
            <div className="inline-flex p-3 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
              <ShieldAlert size={32} className="animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-white">Shield Compromise Alert</h3>
            <p className="text-xs text-white/70 leading-relaxed">{warningMsg}</p>
            <div className="pt-2">
              <span className="text-[10px] text-white/40 block mb-2">Warnings logged: {distractions} / 3</span>
              <button
                onClick={() => setWarningOpen(false)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all uppercase"
              >
                Acknowledge Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Reward Pop */}
      {completionData && (
        <div className="glass-panel p-8 rounded-2xl border border-green-500/20 shadow-glass-cyan text-center max-w-md mx-auto space-y-6">
          <div className="inline-flex p-4 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            <Award size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Shield Completed Successfully!</h3>
            <p className="text-xs text-white/50 mt-1">You maintained browser lock for the chosen countdown period.</p>
          </div>
          <div className="p-4 rounded-xl bg-brandCyan/10 border border-brandCyan/25 flex items-center gap-3 text-left">
            <div className="p-2.5 bg-brandCyan/15 text-brandCyan rounded-lg">
              <Zap size={20} className="fill-brandCyan/10" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Focus Reward Claimed</span>
              <span className="text-[10px] text-brandCyan block">Earned +{completionData.xpEarned} XP point boost.</span>
              {completionData.badgeUnlocked && (
                <span className="text-[10px] text-orange-400 block font-semibold">Unlocked Badge achievement: {completionData.badgeUnlocked}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setCompletionData(null)}
            className="w-full py-3 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all uppercase"
          >
            Dismiss Log
          </button>
        </div>
      )}

      {/* Immersive Focus Active Workspace */}
      {isActive ? (
        <div className="fixed inset-0 z-40 bg-darkBg flex flex-col items-center justify-center p-6 select-none">
          {/* Neon radial backdrop */}
          <div className="absolute w-[400px] h-[400px] bg-brandBlue/5 rounded-full blur-3xl pulse-glow"></div>
          
          <div className="max-w-lg w-full glass-panel border border-brandBlue/20 shadow-glass-blue p-10 rounded-3xl text-center space-y-8 relative">
            <div className="flex justify-between items-center text-xs text-white/30 font-bold border-b border-white/5 pb-4 mb-4">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-brandBlue" /> SECURE SHIELD MODE ACTIVE</span>
              <button 
                onClick={handleForceExit}
                className="p-1 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Distractions status overlay */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map((level) => (
                <div 
                  key={level} 
                  className={`w-10 h-1.5 rounded-full border transition-all ${
                    distractions >= level 
                      ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/30' 
                      : 'bg-white/5 border-white/5'
                  }`}
                />
              ))}
            </div>

            {/* Countdown clock */}
            <div className="py-6">
              <h1 className="text-6xl font-black text-white tracking-widest font-mono">
                {formatTime(timeLeft)}
              </h1>
              <span className="text-[10px] text-white/30 uppercase tracking-widest block mt-3 font-semibold">
                View lock timer
              </span>
            </div>

            <p className="text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
              Please avoid shifting focus from this tab, opening developer options, or pressing escape. System is checking visibility state.
            </p>

            <button
              onClick={handleForceExit}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-950 rounded-xl text-xs font-bold uppercase transition-all shadow-lg"
            >
              Abort Protocol
            </button>
          </div>
        </div>
      ) : (
        // Mode Launcher Panel
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Duration selectors */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 md:col-span-2">
            <h3 className="font-extrabold text-white text-base">Select Focus Period</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '5 Minutes', value: 300 },
                { label: '10 Minutes', value: 600 },
                { label: '25 Minutes', value: 1500 },
                { label: '50 Minutes', value: 3000 },
              ].map((preset) => (
                <div
                  key={preset.value}
                  onClick={() => setDuration(preset.value)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                    duration === preset.value
                      ? 'border-brandCyan bg-brandCyan/10 text-brandCyan shadow-glass-cyan font-bold'
                      : 'border-white/5 bg-slate-950/40 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-bold block">{preset.value / 60}m</span>
                  <span className="text-[10px] text-white/40 mt-1 block">{preset.label}</span>
                </div>
              ))}
            </div>

            {/* Custom input */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs text-white/40 block font-bold">Custom Focus Minutes</label>
              <input
                type="number"
                min="1"
                max="180"
                value={duration / 60}
                onChange={(e) => setDuration(Math.max(60, Number(e.target.value) * 60))}
                className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none outline-0 transition-all"
              />
            </div>

            <button
              onClick={handleStartFocus}
              className="w-full py-4 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-cyan flex items-center justify-center gap-2 uppercase"
            >
              <Play size={16} className="fill-slate-950" /> Initiate Focus Shield
            </button>
          </div>

          {/* Feature explanations */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="font-extrabold text-white text-base">Rules of Engagement</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="p-2 bg-brandCyan/10 text-brandCyan rounded-lg h-fit border border-brandCyan/25 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Fullscreen View Lock</h4>
                  <p className="text-white/50 leading-relaxed">The application switches to fullscreen to isolate study materials and block notifications.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-brandBlue/10 text-brandBlue rounded-lg h-fit border border-brandBlue/25 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Focus Lost Penalty</h4>
                  <p className="text-white/50 leading-relaxed">1st blur: Warns user. 2nd: logs tab-switch to parent. 3rd: restarts session countdown from beginning.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 bg-brandPurple/10 text-brandPurple rounded-lg h-fit border border-brandPurple/25 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-white mb-0.5">XP & Badges Reward</h4>
                  <p className="text-white/50 leading-relaxed">Success grants points. Focus durations exceeding 10 minutes with 0 infractions unlock the Focus Master Badge.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
