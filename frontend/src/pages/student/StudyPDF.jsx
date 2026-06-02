import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { ChevronLeft, Clock, ShieldAlert, Award, ArrowRight, FileText } from 'lucide-react';

const StudyPDF = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const syncRef = useRef(null);

  useEffect(() => {
    fetchHomeworkDetail();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
    };
  }, [id]);

  const fetchHomeworkDetail = async () => {
    try {
      const res = await api.get(`/api/homework/${id}`);
      setData(res.data);
      
      const hw = res.data.homework;
      const sub = res.data.submission;
      
      // Calculate remaining study lock time
      const timeElapsed = sub ? sub.pdfStudyTime : 0;
      const timeLeft = Math.max(0, hw.minStudyTime - timeElapsed);
      
      setRemainingTime(timeLeft);
      if (timeLeft === 0) {
        setTimerCompleted(true);
      } else {
        // Start timers
        startStudyingTimers(timeLeft);
      }
    } catch (err) {
      console.error('Error loading assignment details:', err);
    } finally {
      setLoading(false);
    }
  };

  const startStudyingTimers = (initialTimeLeft) => {
    let currentRemaining = initialTimeLeft;

    // 1. Tick Countdown Timer every second locally
    timerRef.current = setInterval(() => {
      currentRemaining = Math.max(0, currentRemaining - 1);
      setRemainingTime(currentRemaining);

      if (currentRemaining <= 0) {
        setTimerCompleted(true);
        clearInterval(timerRef.current);
        clearInterval(syncRef.current);
      }
    }, 1000);

    // 2. Sync progress to backend database every 5 seconds
    syncRef.current = setInterval(async () => {
      try {
        await api.post(`/api/homework/${id}/study`, { seconds: 5 });
      } catch (err) {
        console.error('Failed to sync study time progress', err);
      }
    }, 5000);
  };

  // Immediate sync when leaving or unlocking
  const triggerUnlock = async () => {
    setIsSubmitting(true);
    try {
      // Final sync check
      const res = await api.post(`/api/homework/${id}/study`, { seconds: 0 });
      if (res.data.pdfCompleted) {
        navigate(`/student/homework/${id}/quiz`);
      } else {
        alert('Server verification failed. Please wait for the timer to synchronize.');
      }
    } catch (err) {
      console.error('Lock release failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-t-2 border-brandCyan animate-spin"></div>
      </div>
    );
  }

  const { homework, submission } = data;
  const pdfFullPath = `https://focus-shield-project.onrender.com/${homework.pdfPath}`;

  // Formatted seconds
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate('/student/homework')}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-brandCyan transition-colors font-bold uppercase tracking-wider"
        >
          <ChevronLeft size={16} /> Back to Protocols
        </button>

        {/* Lock / Unlock Bar */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {timerCompleted ? (
            <button
              onClick={triggerUnlock}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 shadow-glass-cyan flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              Unlock Quiz Exam <ArrowRight size={15} />
            </button>
          ) : (
            <div className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2.5 rounded-xl text-xs font-bold shadow-inner">
              <Clock size={16} className="animate-pulse" />
              <span>Study Lock Active: {formatTime(remainingTime)} remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment overview panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start gap-4">
        <div className="p-3.5 bg-brandCyan/10 text-brandCyan rounded-xl border border-brandCyan/20 shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-white">{homework.title}</h3>
          <p className="text-xs text-white/50 leading-relaxed mt-1">{homework.description}</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-brandCyan font-bold mt-2">
            <Award size={13} /> Earns +{homework.rewardXp} XP points upon passing quiz test
          </span>
        </div>
      </div>

      {/* Document Viewer container */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden h-[600px] flex flex-col relative">
        <div className="bg-slate-950/80 px-4 py-2 text-xs text-white/40 border-b border-white/5 flex items-center gap-2">
          <Clock size={12} />
          <span>Locked PDF Document Sandbox</span>
        </div>
        
        {/* PDF embedding or mock view fallback if PDF path not found */}
        <div className="flex-1 bg-slate-950">
          <iframe
            src={pdfFullPath}
            title={homework.title}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default StudyPDF;
