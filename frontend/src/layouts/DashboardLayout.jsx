import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { 
  LayoutDashboard, BookOpen, ShieldAlert, Award, BarChart3, User, Settings,
  UploadCloud, PlusCircle, LineChart, Users, Bell, LogOut, Menu, X, Flame, Zap
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Sync user details periodically to keep XP/Streak accurate
  useEffect(() => {
    refreshUser();
    fetchUnreadNotifications();
    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 15000); // Poll notifications every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      const unread = res.data.filter(n => !n.read).length;
      setUnreadNotifications(unread);
    } catch (err) {
      console.error('Failed to fetch notifications count', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'Homework', path: '/student/homework', icon: BookOpen },
          { name: 'Focus Mode', path: '/student/focus', icon: ShieldAlert },
          { name: 'Rewards Shop', path: '/student/rewards', icon: Award },
          { name: 'Analytics', path: '/student/analytics', icon: BarChart3 },
          { name: 'Profile', path: '/student/profile', icon: User },
          { name: 'Settings', path: '/student/settings', icon: Settings },
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
          { name: 'Upload Homework', path: '/teacher/upload', icon: UploadCloud },
          { name: 'Create MCQ Quiz', path: '/teacher/create-quiz', icon: PlusCircle },
          { name: 'Student Analytics', path: '/teacher/analytics', icon: LineChart },
          { name: 'Settings', path: '/student/settings', icon: Settings }, // Settings shared
        ];
      case 'parent':
        return [
          { name: 'Dashboard', path: '/parent', icon: LayoutDashboard },
          { name: 'Progress Reports', path: '/parent/reports', icon: BarChart3 },
          { name: 'Focus Monitoring', path: '/parent/focus-logs', icon: ShieldAlert },
          { name: 'Settings', path: '/student/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen overflow-hidden bg-darkBg text-brandText">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-white/5 m-4 rounded-2xl overflow-y-auto">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-brandBlue/10 text-brandCyan rounded-lg border border-brandCyan/20 shadow-glass-cyan">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-brandBlue via-brandCyan to-brandPurple bg-clip-text text-transparent">
              FOCUS SHIELD
            </h1>
            <p className="text-[10px] text-white/40 tracking-wider">LEARN SMARTER</p>
          </div>
        </div>

        {/* User stats block on Sidebar (Student Only) */}
        {user?.role === 'student' && (
          <div className="mx-4 mt-6 p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-white/50">Level {user.level}</span>
              <span className="text-[10px] font-bold text-brandCyan bg-brandCyan/10 px-2 py-0.5 rounded-full">
                {user.xp} XP
              </span>
            </div>
            {/* XP progress bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brandBlue to-brandCyan h-full transition-all duration-300"
                style={{ width: `${user.xp % 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Flame size={14} className="text-orange-500 fill-orange-500" />
                Streak: {user.streak} days
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brandBlue/20 to-brandCyan/10 border border-brandCyan/30 text-brandCyan shadow-glass-cyan'
                    : 'hover:bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Slideout */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-darkBg/60 backdrop-blur-md">
          <aside className="w-64 glass-panel border-r border-white/10 flex flex-col h-full animate-slide-in p-4">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10">
              <span className="font-extrabold text-brandCyan">FOCUS SHIELD</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/60">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brandBlue/20 border border-brandCyan/30 text-brandCyan'
                        : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-auto"
            >
              <LogOut size={18} />
              Logout
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 glass-panel border-b border-white/5 m-4 mb-0 rounded-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-white/70 hover:bg-white/5 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold">Welcome back, {user?.name}</h2>
              <p className="text-xs text-white/40 capitalize">{user?.role} Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Status indicators for mobile */}
            {user?.role === 'student' && (
              <div className="hidden sm:flex items-center gap-3 text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <span className="flex items-center gap-1">
                  <Flame size={14} className="text-orange-500 fill-orange-500" />
                  {user.streak}d
                </span>
                <span className="text-white/20">|</span>
                <span className="flex items-center gap-1 font-bold text-brandCyan">
                  <Zap size={14} className="fill-brandCyan" />
                  {user.xp} XP
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <Link 
              to="/student/notifications" 
              className="relative p-2.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brandCyan text-[9px] font-bold text-slate-950 flex items-center justify-center rounded-full border-2 border-darkBg animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile Avatar Trigger */}
            <div 
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-3 cursor-pointer bg-white/5 hover:bg-white/10 p-1.5 pr-3 rounded-xl border border-white/5 transition-all"
            >
              <img
                src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user?.avatar || 'avatar-1'}`}
                alt="user avatar"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-white/15"
              />
              <span className="hidden lg:inline text-xs font-semibold">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Inner Content with scroll */}
        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
