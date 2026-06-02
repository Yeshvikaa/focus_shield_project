import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { ChevronLeft, Clock, ShieldAlert, Award, AlertCircle, BookOpen } from 'lucide-react';

const ProgressReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const childId = new URLSearchParams(location.search).get('childId');

  const [childrenList, setChildrenList] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      fetchReportData();
    } else {
      fetchChildrenList();
    }
  }, [childId]);

  const fetchChildrenList = async () => {
    try {
      const res = await api.get('/api/parent/children');
      setChildrenList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/parent/child/${childId}/report`);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load child progress report:', err);
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

  // If no child is selected, show profile selector
  if (!childId) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-white">Select Student Account</h2>
          <p className="text-xs text-white/50 mt-1">Please choose a linked child to analyze progress reports.</p>
        </div>

        {childrenList.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/5 space-y-3">
            <AlertCircle className="mx-auto text-yellow-500" size={40} />
            <p className="text-sm text-white/40">No student accounts linked.</p>
            <Link to="/parent" className="text-xs font-bold text-brandCyan hover:underline block">Return to linker widget</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {childrenList.map((child) => (
              <div
                key={child._id}
                onClick={() => navigate(`/parent/reports?childId=${child._id}`)}
                className="p-4 rounded-xl glass-panel border border-white/5 hover:border-brandCyan/20 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex gap-3 items-center">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${child.avatar}`}
                    className="w-10 h-10 bg-slate-950 rounded-lg p-1 border border-white/10"
                    alt="child bot avatar"
                  />
                  <div>
                    <span className="font-bold text-white block">{child.name}</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">Level {child.level} status</span>
                  </div>
                </div>
                <ChevronLeft size={16} className="rotate-180 text-white/40" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const { child, stats, submissions } = report;

  // Pie chart variables
  const completionData = [
    { name: 'Completed', value: stats.completedHomeworkCount, color: '#22D3EE' },
    { name: 'Pending', value: Math.max(0, stats.totalHomeworkCount - stats.completedHomeworkCount), color: '#ffffff10' }
  ];

  // Map submissions to graph values
  const submissionGraph = submissions.map(sub => ({
    name: sub.homework?.title?.substring(0, 10) || 'Homework',
    readTime: Math.round(sub.pdfStudyTime / 60), // minutes
    attempts: sub.attempts
  }));

  const formatHours = (seconds) => {
    if (!seconds) return '0h';
    return (seconds / 3600).toFixed(1) + ' hrs';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/parent')}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-brandCyan font-bold uppercase tracking-wider transition-colors"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </button>

        <Link
          to={`/parent/focus-logs?childId=${childId}`}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-950/80 border border-white/10 hover:border-brandCyan/30 text-white hover:text-brandCyan text-xs font-bold rounded-xl transition-all"
        >
          Audit Focus Breach Logs
        </Link>
      </div>

      {/* Profile Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex gap-4 items-center flex-col sm:flex-row text-center sm:text-left">
          <img 
            src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${child.avatar}`}
            className="w-16 h-16 bg-slate-950 rounded-2xl border border-white/10 p-2 shadow-inner"
            alt="child bot avatar"
          />
          <div>
            <h3 className="text-xl font-extrabold text-white">{child.name}</h3>
            <p className="text-xs text-white/50 mt-1">Audit status profile for level {child.level} student</p>
            <div className="flex gap-2 justify-center sm:justify-start mt-2">
              <span className="text-[10px] bg-brandCyan/10 text-brandCyan border border-brandCyan/25 px-2 py-0.5 rounded-full font-bold">
                {child.xp} XP Points
              </span>
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/25 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                Streak: {child.streak} days
              </span>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="text-center md:text-right shrink-0">
          <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider mb-2">Unlocked Badges</span>
          <div className="flex gap-1.5 justify-center md:justify-end">
            {child.badges.length === 0 ? (
              <span className="text-xs text-white/30 italic">No badges earned yet.</span>
            ) : (
              child.badges.map(b => (
                <span key={b} className="text-[9px] px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold capitalize">
                  {b.replace(/_/g, ' ')}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Focus time */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Total Focus Time</span>
            <span className="text-2xl font-black text-white mt-1 block">{formatHours(stats?.totalFocusTime)}</span>
          </div>
          <div className="p-3 bg-brandBlue/15 text-brandBlue rounded-xl border border-brandBlue/20">
            <Clock size={20} />
          </div>
        </div>

        {/* Distractions count */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Tab Warnings Logged</span>
            <span className={`text-2xl font-black mt-1 block ${stats?.totalDistractions > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats?.totalDistractions}
            </span>
          </div>
          <div className="p-3 bg-red-500/15 text-red-400 rounded-xl border border-red-500/20">
            <ShieldAlert size={20} />
          </div>
        </div>

        {/* Completion rate */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Homework Pass Rate</span>
            <span className="text-2xl font-black text-green-400 mt-1 block">
              {stats.totalHomeworkCount > 0 ? Math.round((stats.completedHomeworkCount / stats.totalHomeworkCount) * 100) : 0}%
            </span>
          </div>
          <div className="p-3 bg-green-500/15 text-green-400 rounded-xl border border-green-500/20">
            <BookOpen size={20} />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Study chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-sm">Study Lock Duration Trend</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Minutes logged viewing study materials per PDF assignment.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={submissionGraph} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#22d3ee', fontSize: '11px' }}
                />
                <Bar dataKey="readTime" name="Study Time (mins)" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-white text-sm">Homework Completion Breakdown</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Ratio of completed vs pending assignments.</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{stats.completedHomeworkCount}</span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Done</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs font-semibold pt-4 border-t border-white/5">
            <span className="flex items-center gap-1.5 text-brandCyan"><div className="w-2.5 h-2.5 bg-brandCyan rounded-full"></div> Completed</span>
            <span className="flex items-center gap-1.5 text-white/30"><div className="w-2.5 h-2.5 bg-white/10 rounded-full"></div> Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReports;
