import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import { ChevronLeft, ShieldAlert, Clock, AlertTriangle, UserCheck } from 'lucide-react';

const FocusMonitoring = () => {
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
      console.error('Failed to load child distraction reports:', err);
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
          <p className="text-xs text-white/50 mt-1">Choose a linked student child to audit focus breach logs.</p>
        </div>

        {childrenList.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/5 space-y-3">
            <AlertTriangle className="mx-auto text-yellow-500" size={40} />
            <p className="text-sm text-white/40">No student accounts linked.</p>
            <Link to="/parent" className="text-xs font-bold text-brandCyan hover:underline block">Return to linker widget</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {childrenList.map((child) => (
              <div
                key={child._id}
                onClick={() => navigate(`/parent/focus-logs?childId=${child._id}`)}
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

  const { child, stats, distractions, focusSessions } = report;

  const formatHours = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/parent')}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-brandCyan font-bold uppercase tracking-wider transition-colors"
        >
          <ChevronLeft size={16} /> Back to dashboard
        </button>

        <Link
          to={`/parent/reports?childId=${childId}`}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-950/80 border border-white/10 hover:border-brandCyan/30 text-white hover:text-brandCyan text-xs font-bold rounded-xl transition-all"
        >
          Analyze Progress Reports
        </Link>
      </div>

      {/* Child summary */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex gap-4 items-center">
        <img 
          src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${child.avatar}`}
          className="w-12 h-12 bg-slate-950 rounded-xl border border-white/10 p-1.5 shadow-inner shrink-0"
          alt="child bot avatar"
        />
        <div>
          <h3 className="text-base font-extrabold text-white">Focus Breach logs: {child.name}</h3>
          <p className="text-[11px] text-white/50 mt-0.5">Audit trail detailing browser visibility warning logs.</p>
        </div>
      </div>

      {/* Double columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Timeline violations */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-extrabold text-white text-sm">Distraction timeline</h4>
          
          {distractions.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
              <UserCheck className="mx-auto text-green-400 mb-4" size={40} />
              <p className="text-xs text-white/40">Zero focus breaches recorded. {child.name} is studying with high discipline!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {distractions.map((log, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-red-500/10 flex gap-3 items-start text-xs shadow-inner">
                  <div className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg shrink-0">
                    <ShieldAlert size={16} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-white capitalize">{log.type.replace('-', ' ')} Alert</span>
                      <span className="text-[9px] text-white/30">
                        {new Date(log.timestamp).toLocaleDateString()} @ {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-white/60 leading-normal text-[11px]">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: focus session stats */}
        <div className="space-y-6">
          {/* Stats card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
            <h4 className="font-extrabold text-white text-sm">Focus Shield Summary</h4>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-[9px] text-white/40 block font-bold uppercase mb-1">Time Lock</span>
                <span className="font-black text-white text-sm">{formatHours(stats?.totalFocusTime)}</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-[9px] text-white/40 block font-bold uppercase mb-1">Violations</span>
                <span className={`font-black text-sm ${stats?.totalDistractions > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats?.totalDistractions}
                </span>
              </div>
            </div>
          </div>

          {/* Historical focus sessions */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="font-extrabold text-white text-sm">Recent Focus Sessions</h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {focusSessions.length === 0 ? (
                <span className="text-xs text-white/30 italic block py-4 text-center">No focus sessions recorded yet.</span>
              ) : (
                focusSessions.map((sess) => (
                  <div key={sess._id} className="p-3 rounded-lg bg-slate-950/60 border border-white/5 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-white">{formatHours(sess.duration)} Session</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        sess.status === 'completed' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {sess.status === 'completed' ? 'Success' : 'Aborted'}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/40">
                      <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                      <span className={sess.distractionCount > 0 ? 'text-red-400/80' : ''}>
                        {sess.distractionCount} infractions
                      </span>
                    </div>
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

export default FocusMonitoring;
