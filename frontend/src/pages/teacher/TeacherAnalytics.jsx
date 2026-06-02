import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, LineChart, Line 
} from 'recharts';
import { Users, BookOpen, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

const TeacherAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/teacher/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load class metrics:', err);
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

  const { summary, rankings, weakAreas, performanceTrend } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Classroom Performance Analytics</h2>
        <p className="text-xs text-white/50 mt-1">Review aggregated parameters mapping assignment progress and quiz milestones.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Class Size</span>
            <span className="text-2xl font-black text-white mt-1 block">{summary?.totalStudents} Students</span>
          </div>
          <div className="p-3 bg-brandBlue/15 text-brandBlue rounded-xl border border-brandBlue/20">
            <Users size={20} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Assignments Published</span>
            <span className="text-2xl font-black text-white mt-1 block">{summary?.totalHomeworks} Published</span>
          </div>
          <div className="p-3 bg-brandCyan/15 text-brandCyan rounded-xl border border-brandCyan/20">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">Class Completion %</span>
            <span className="text-2xl font-black text-green-400 mt-1 block">{summary?.completionRate}%</span>
          </div>
          <div className="p-3 bg-green-500/15 text-green-400 rounded-xl border border-green-500/20">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Visual Aggregates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Homework Completion Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-sm">Study Protocol Completion Rates</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Percentage completion recorded per published PDF assignment.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#22d3ee', fontSize: '11px' }}
                />
                <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Curriculum Warnings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-sm">Diagnostic Weak Areas</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Flagged topics where quiz attempts exceed standard averages.</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64 pr-1 pt-2">
            {weakAreas.map((area, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white truncate max-w-[130px]">{area.topic}</span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                    area.difficulty === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    area.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {area.difficulty} Risk
                  </span>
                </div>
                <p className="text-white/50 leading-relaxed text-[10px]">{area.suggestion}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Rankings Detail Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h3 className="font-extrabold text-white text-sm">Enrollment ranking List</h3>
          <p className="text-[10px] text-white/40 mt-0.5">List of students registered inside this command space, ranked by accumulated XP.</p>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-bold uppercase text-[10px]">
                <th className="pb-3 pl-3">Rank</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Active Streak</th>
                <th className="pb-3">Level Status</th>
                <th className="pb-3 pr-3 text-right">XP Points</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((student, idx) => (
                <tr key={student._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3.5 pl-3 font-bold text-white/40">#{idx + 1}</td>
                  <td className="py-3.5 font-bold text-white">{student.name}</td>
                  <td className="py-3.5 text-orange-400 font-semibold">{student.streak} days</td>
                  <td className="py-3.5 text-brandPurple font-bold">Lvl {student.level}</td>
                  <td className="py-3.5 pr-3 text-right font-black text-brandCyan">{student.xp} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
