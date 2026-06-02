import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Flame, ShieldAlert, Award, Zap, BookOpen, Clock, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/student/dashboard');
      setStats(statsRes.data);
      
      const notifRes = await api.get('/student/notifications');
      setRecentNotifications(notifRes.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-t-2 border-brandCyan animate-spin"></div>
      </div>
    );
  }

  // Format seconds to human readable hours/minutes
  const formatFocusTime = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Level Banner Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brandCyan/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brandBlue/15 border border-brandCyan/20 flex items-center justify-center text-brandCyan shadow-glass-cyan text-2xl font-extrabold select-none">
            {stats?.level}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Shield Level {stats?.level}</h3>
            <p className="text-xs text-white/50 mt-1">Accumulate {100 - (stats?.xp % 100)} more XP to reach Level {stats ? stats.level + 1 : ''}</p>
            {/* XP Bar */}
            <div className="w-64 bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brandBlue to-brandCyan h-full transition-all duration-500"
                style={{ width: `${(stats?.xp || 0) % 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Streak & XP Display */}
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-lg">
              <Flame size={20} className="fill-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold block">Current Streak</span>
              <span className="text-base font-extrabold text-white">{stats?.streak} Days</span>
            </div>
          </div>

          <div className="glass-panel px-4 py-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="p-2.5 bg-brandCyan/10 text-brandCyan rounded-lg">
              <Zap size={20} className="fill-brandCyan" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold block">Total Points</span>
              <span className="text-base font-extrabold text-brandCyan">{stats?.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-bold block uppercase tracking-wider">Focus Duration</span>
            <span className="text-2xl font-black text-white mt-1 block">{formatFocusTime(stats?.totalFocusTime)}</span>
          </div>
          <div className="p-3 bg-brandBlue/15 text-brandBlue rounded-xl border border-brandBlue/20">
            <Clock size={20} />
          </div>
        </div>

        {/* Homework Stats */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-bold block uppercase tracking-wider">Homework Done</span>
            <span className="text-2xl font-black text-white mt-1 block">{stats?.completedHomeworks} / {stats?.totalHomeworks}</span>
          </div>
          <div className="p-3 bg-brandCyan/15 text-brandCyan rounded-xl border border-brandCyan/20">
            <BookOpen size={20} />
          </div>
        </div>

        {/* Distraction count */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-bold block uppercase tracking-wider">Distractions Logged</span>
            <span className={`text-2xl font-black mt-1 block ${stats?.totalDistractions > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats?.totalDistractions}
            </span>
          </div>
          <div className="p-3 bg-red-500/15 text-red-400 rounded-xl border border-red-500/20">
            <ShieldAlert size={20} />
          </div>
        </div>

        {/* Badges unlocked */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 font-bold block uppercase tracking-wider">Badges Unlocked</span>
            <span className="text-2xl font-black text-brandPurple mt-1 block">{stats?.badges?.length || 0} Badges</span>
          </div>
          <div className="p-3 bg-brandPurple/15 text-brandPurple rounded-xl border border-brandPurple/20">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Quick Actions & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Study Launch Card */}
          <div className="glass-panel p-6 rounded-2xl border border-brandCyan/20 shadow-glass-cyan relative overflow-hidden flex justify-between items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandCyan/5 rounded-full blur-2xl"></div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">Unstudied Assignments Pending</h4>
              <p className="text-xs text-white/60">Ready to start the discipline cycle? Study PDFs, beat the timer, and claim XP.</p>
              <button 
                onClick={() => navigate('/student/homework')}
                className="mt-4 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-brandBlue to-brandCyan rounded-lg shadow-glass-cyan hover:opacity-90 transition-all"
              >
                Launch Study Workspace
              </button>
            </div>
            <BookOpen size={48} className="text-brandCyan/20 hidden sm:block" />
          </div>

          {/* Next assignment detail */}
          {stats?.upcomingHomework && (
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Upcoming Assignment Protocol</span>
                <span className="font-bold text-white text-sm block truncate">{stats.upcomingHomework.title}</span>
                <span className="text-xs text-white/60 block mt-0.5">
                  Due date: {new Date(stats.upcomingHomework.dueDate).toLocaleDateString()}
                </span>
              </div>
              <Link 
                to="/student/homework" 
                className="text-xs font-bold text-brandCyan hover:underline shrink-0"
              >
                Start Study
              </Link>
            </div>
          )}

          {/* Quick Focus mode banner */}
          <div className="glass-panel p-6 rounded-2xl border border-brandPurple/20 shadow-glass-purple relative overflow-hidden flex justify-between items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl"></div>
            <div>
              <h4 className="text-base font-bold text-white mb-1 font-outfit">Enable Smart Focus Shield</h4>
              <p className="text-xs text-white/60">Lock your browser viewport, log window switches, and earn focus points.</p>
              <button 
                onClick={() => navigate('/student/focus')}
                className="mt-4 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-brandPurple to-brandBlue rounded-lg shadow-glass-purple hover:opacity-90 transition-all"
              >
                Initiate Focus Block
              </button>
            </div>
            <ShieldAlert size={48} className="text-brandPurple/20 hidden sm:block" />
          </div>
        </div>

        {/* Right column: Recent notifications & alerts */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col h-full">
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
              <h4 className="font-bold text-white text-sm">Security Logs</h4>
              <Link to="/student/notifications" className="text-xs text-brandCyan hover:underline">View All</Link>
            </div>

            <div className="space-y-3 flex-1">
              {recentNotifications.length === 0 ? (
                <div className="text-center text-white/30 text-xs py-8">
                  No alerts or logs compiled.
                </div>
              ) : (
                recentNotifications.map((notif) => (
                  <div key={notif._id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        notif.type === 'distraction' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        notif.type === 'motivation' ? 'bg-brandCyan/10 text-brandCyan border border-brandCyan/20' :
                        notif.type === 'streak' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-brandBlue/10 text-brandBlue border border-brandBlue/20'
                      }`}>
                        {notif.type}
                      </span>
                      <span className="text-[9px] text-white/30">{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-white/70 leading-normal mt-1">{notif.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
