import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import {
  Users,
  BookOpen,
  Clock,
  FilePlus,
  PlusCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    summary: {},
    rankings: [],
    weakAreas: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ FIXED: removed duplicate /api
      const res = await api.get('/teacher/analytics');

      setData({
        summary: res.data?.summary || {},
        rankings: res.data?.rankings || [],
        weakAreas: res.data?.weakAreas || []
      });
    } catch (err) {
      console.error('Failed to load class analytics:', err);

      // ✅ Prevent crash even if backend fails
      setData({
        summary: {},
        rankings: [],
        weakAreas: []
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

  const { summary, rankings, weakAreas } = data;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Teacher Command Center
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Manage assignments, quizzes, and student performance insights.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/teacher/upload"
            className="px-4 py-2.5 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-1.5"
          >
            <FilePlus size={15} /> Add Homework
          </Link>

          <Link
            to="/teacher/create-quiz"
            className="px-4 py-2.5 bg-brandPurple text-white font-extrabold rounded-xl text-xs uppercase flex items-center gap-1.5"
          >
            <PlusCircle size={15} /> Build Quiz
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs text-white/40 uppercase">Class Enrollment</span>
          <div className="text-2xl font-black text-white">
            {summary?.totalStudents ?? 0} Students
          </div>
          <Users className="text-brandBlue mt-2" />
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs text-white/40 uppercase">Active Protocols</span>
          <div className="text-2xl font-black text-white">
            {summary?.totalHomeworks ?? 0} Published
          </div>
          <BookOpen className="text-brandCyan mt-2" />
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs text-white/40 uppercase">Completion Rate</span>
          <div className="text-2xl font-black text-green-400">
            {summary?.completionRate ?? 0}%
          </div>
          <CheckCircle className="text-green-400 mt-2" />
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs text-white/40 uppercase">Avg Attempts</span>
          <div className="text-2xl font-black text-brandPurple">
            {summary?.averageAttempts ?? 0} Runs
          </div>
          <Clock className="text-brandPurple mt-2" />
        </div>

      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Class Leaderboard</h3>
            <Link to="/teacher/analytics" className="text-xs text-brandCyan">
              <BarChart3 size={12} /> Reports
            </Link>
          </div>

          {rankings.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-6">
              No student data available
            </p>
          ) : (
            rankings.map((student, idx) => (
              <div
                key={student._id || idx}
                className="flex justify-between items-center p-3 bg-white/5 rounded-xl mb-2"
              >
                <div>
                  <div className="text-white font-bold">
                    #{idx + 1} {student.name}
                  </div>
                  <div className="text-xs text-white/40">
                    {student.email}
                  </div>
                </div>

                <div className="text-brandCyan font-bold">
                  {student.xp ?? 0} XP
                </div>
              </div>
            ))
          )}

        </div>

        {/* Insights */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-bold text-white mb-4">
            Curriculum Insights
          </h3>

          {weakAreas.length === 0 ? (
            <p className="text-white/40 text-sm">
              No weak areas detected
            </p>
          ) : (
            weakAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/5 rounded-xl mb-2"
              >
                <div className="flex justify-between">
                  <span className="text-white font-bold text-sm">
                    {area.topic}
                  </span>

                  <span className="text-xs text-yellow-400">
                    {area.difficulty}
                  </span>
                </div>

                <p className="text-xs text-white/60 mt-1">
                  {area.suggestion}
                </p>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
};

export default TeacherDashboard;