import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { BookOpen, CheckCircle2, ChevronRight, Lock, HelpCircle, Clock, Zap } from 'lucide-react';

const HomeworkList = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const res = await api.get('/api/homework');
      setHomeworks(res.data);
    } catch (err) {
      console.error('Error fetching homeworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'border-green-500/20 bg-green-500/5 text-green-400';
      case 'quiz_ready': return 'border-brandCyan/20 bg-brandCyan/5 text-brandCyan';
      default: return 'border-white/5 bg-white/5 text-white/60';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-t-2 border-brandCyan animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">Your Study protocols</h2>
        <p className="text-xs text-white/50 mt-1">
          Complete the standard loop: Study the PDF document until the lock releases, then pass the MCQ test to receive rewards.
        </p>
      </div>

      {homeworks.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
          <BookOpen className="mx-auto text-white/20 mb-4" size={48} />
          <p className="text-sm text-white/40">No study protocols published by your teacher yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {homeworks.map((hw) => {
            const sub = hw.submission;
            const isCompleted = sub.status === 'completed';
            const isQuizReady = sub.status === 'quiz_ready';
            const isStudying = sub.status === 'studying';
            const progressPercent = Math.min(100, Math.round((sub.pdfStudyTime / hw.minStudyTime) * 100));

            return (
              <div
                key={hw._id}
                className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg ${
                  isCompleted ? 'border-green-500/10' :
                  isQuizReady ? 'border-brandCyan/20' : 'border-white/5'
                }`}
              >
                {/* Info Block */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-extrabold text-white text-base">{hw.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                      {sub.status === 'completed' ? 'Passed' : 
                       sub.status === 'quiz_ready' ? 'Quiz Unlocked' : 'Studying PDF'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {hw.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-white/40 font-semibold pt-1">
                    <span className="flex items-center gap-1 text-brandCyan">
                      <Zap size={13} className="fill-brandCyan" />
                      +{hw.rewardXp} XP Reward
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      Req: {Math.round(hw.minStudyTime / 60)}m read lock
                    </span>
                    <span>•</span>
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress Indicators / Interactive Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                  {/* Visual study progression */}
                  <div className="w-full sm:w-32 bg-slate-950 p-3 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                    <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider mb-1">Study Lock</span>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                      {isCompleted || isQuizReady ? (
                        <span className="text-brandCyan flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-brandCyan fill-brandCyan/20" /> Complete
                        </span>
                      ) : (
                        <span>{sub.pdfStudyTime}s / {hw.minStudyTime}s</span>
                      )}
                    </div>
                    {/* Progress mini bar */}
                    {!isCompleted && !isQuizReady && (
                      <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
                        <div className="bg-brandCyan h-full" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    )}
                  </div>

                  {/* Main trigger CTA */}
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20 justify-center">
                      <CheckCircle2 size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Protocol Passed</span>
                    </div>
                  ) : isQuizReady ? (
                    <button
                      onClick={() => navigate(`/student/homework/${hw._id}/quiz`)}
                      className="px-5 py-3 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-cyan flex items-center justify-center gap-1.5 uppercase"
                    >
                      <HelpCircle size={15} />
                      Attempt Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/homework/${hw._id}/study`)}
                      className="px-5 py-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brandCyan/20 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 uppercase"
                    >
                      <BookOpen size={15} />
                      Open PDF Lock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeworkList;
