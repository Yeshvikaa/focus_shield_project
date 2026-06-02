import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { UserCheck, ShieldAlert, Award, Flame, Zap, ArrowRight, UserPlus, ChevronRight } from 'lucide-react';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentCode, setParentCode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await api.get('/api/parent/children');
      setChildren(res.data);
    } catch (err) {
      console.error('Failed to load children list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e) => {
    e.preventDefault();
    if (!parentCode.trim()) return setErrorMsg('Please enter a parent code.');

    setIsSubmitting(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const res = await api.post('/api/parent/link', { parentCode: parentCode.toUpperCase() });
      setStatusMsg(res.data.message || 'Child account linked successfully!');
      setParentCode('');
      fetchChildren(); // reload list
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to link account. Please check the code.');
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Parent Monitoring Workspace</h2>
        <p className="text-xs text-white/50 mt-1">Link student credentials and audit active focus timelines.</p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-brandCyan/15 border border-brandCyan/20 text-xs text-brandCyan text-center">
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Children profiles list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-white text-sm">Linked Student Profiles</h3>

          {children.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-3">
              <UserCheck className="mx-auto text-white/20" size={40} />
              <p className="text-sm text-white/40">No student accounts linked to this parent profile yet.</p>
              <p className="text-xs text-white/30 max-w-sm mx-auto leading-relaxed">
                Retrieve the Parent Code from the student profile page and use the linker widget on the right to connect.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div 
                  key={child._id}
                  className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-brandCyan/10 transition-all flex flex-col justify-between h-48 group shadow-lg"
                >
                  <div className="flex gap-3 items-start">
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${child.avatar}`}
                      alt="Student mini bot"
                      className="w-12 h-12 bg-slate-950 rounded-xl border border-white/10 p-1 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm block">{child.name}</h4>
                      <span className="text-[10px] text-white/40 block">{child.email}</span>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-brandCyan bg-brandCyan/10 px-2 py-0.5 rounded-full">Lvl {child.level}</span>
                        <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Flame size={10} className="fill-orange-400" />
                          {child.streak}d
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/parent/reports?childId=${child._id}`)}
                    className="w-full py-2.5 bg-white/5 border border-white/5 group-hover:border-brandCyan/20 text-white group-hover:text-brandCyan text-[11px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide"
                  >
                    Analyze Metrics <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Linking widget */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="p-3 bg-brandBlue/10 text-brandBlue border border-brandBlue/20 rounded-xl w-fit">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Link Student Account</h3>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">
                Enter the student parent code (e.g. FS-XXXXXX) retrieved from your child's profile screen.
              </p>
            </div>

            <form onSubmit={handleLinkChild} className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="FS-XXXXXX"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 focus:border-brandCyan text-xs font-bold rounded-xl py-3 px-4 text-white uppercase text-center tracking-widest outline-none outline-0 transition-all placeholder:tracking-normal placeholder:font-normal"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-cyan flex items-center justify-center gap-1.5 uppercase"
              >
                Authenticate child Link
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
