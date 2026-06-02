import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Clock,
  ShieldAlert,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';

const StudentAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Dashboard stats
      const boardRes = await api.get('/student/dashboard');

      // Homework list
      const hwRes = await api.get('/homework');

      const homeworkList = Array.isArray(hwRes.data)
        ? hwRes.data
        : [];

      const completionTrend = homeworkList.map((hw) => ({
        name: hw.title?.substring(0, 10) || 'Homework',
        studyTime: Math.round(
          (hw.submission?.pdfStudyTime || 0) / 60
        ),
        attempts: hw.submission?.attempts || 0
      })).reverse();

      setData({
        dashboard: boardRes.data,
        completionTrend
      });
    } catch (err) {
      console.error('Error fetching analytics details:', err);

      // Prevent crash if API fails
      setData({
        dashboard: {
          totalFocusTime: 0,
          totalDistractions: 0,
          streak: 0
        },
        completionTrend: []
      });
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

  if (!data) {
    return (
      <div className="text-white p-4">
        Analytics data unavailable.
      </div>
    );
  }

  const { dashboard, completionTrend } = data;

  const formatHours = (seconds) => {
    if (!seconds) return '0h';
    return (seconds / 3600).toFixed(1) + ' hrs';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">
          Your Analytics Dashboard
        </h2>
        <p className="text-xs text-white/50 mt-1">
          Detailed feedback report mapping your focus milestones and study trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">
              Total Focus Shield Time
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {formatHours(dashboard?.totalFocusTime)}
            </span>
          </div>

          <div className="p-3 bg-brandBlue/15 text-brandBlue rounded-xl border border-brandBlue/20">
            <Clock size={20} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">
              Breach Warnings Logged
            </span>
            <span className="text-2xl font-black text-red-400 mt-1 block">
              {dashboard?.totalDistractions || 0}
            </span>
          </div>

          <div className="p-3 bg-red-500/15 text-red-400 rounded-xl border border-red-500/20">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 font-bold block uppercase tracking-wider">
              Discipline Streaks
            </span>
            <span className="text-2xl font-black text-orange-400 mt-1 block">
              {dashboard?.streak || 0} Days
            </span>
          </div>

          <div className="p-3 bg-orange-500/15 text-orange-400 rounded-xl border border-orange-500/20">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
          <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Study Time Progression
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                PDF reading time logged per assignment.
              </p>
            </div>

            <Calendar size={16} className="text-white/35" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="studyTime"
                  stroke="#22D3EE"
                  fill="#22D3EE"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Quiz Reattempts
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">
                Attempts per assignment.
              </p>
            </div>

            <Award size={16} className="text-white/35" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;