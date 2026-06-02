import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { Bell, ShieldAlert, Award, Flame, Zap, Eye, Check } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/student/notifications/${id}`);
      // Update local state
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to update notification status:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => api.put(`/student/notifications/${n._id}`)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to update notifications status:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'distraction': return <ShieldAlert className="text-red-400" size={18} />;
      case 'motivation': return <Award className="text-brandCyan" size={18} />;
      case 'streak': return <Flame className="text-orange-500 fill-orange-500/10" size={18} />;
      default: return <Bell className="text-brandBlue" size={18} />;
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'distraction': return 'bg-red-500/10 border-red-500/20';
      case 'motivation': return 'bg-brandCyan/10 border-brandCyan/20';
      case 'streak': return 'bg-orange-500/10 border-orange-500/20';
      default: return 'bg-brandBlue/10 border-brandBlue/20';
    }
  };

  // Filtering list
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-t-2 border-brandCyan animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-outfit">Security Notifications Center</h2>
          <p className="text-xs text-white/50 mt-1">Review alerts detailing focus breaches, study progression, and assignments due.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-white/10 hover:border-brandCyan/30 text-white hover:text-brandCyan text-xs font-bold rounded-xl transition-all"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 text-xs w-fit">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: 'Read Archive' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filter === tab.key
                ? 'bg-brandBlue text-slate-950 shadow-md font-extrabold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
          <Bell className="mx-auto text-white/20 mb-4 animate-bounce" size={40} />
          <p className="text-sm text-white/40">No notifications found matching filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`glass-panel p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                !notif.read ? 'border-white/10 bg-slate-900/40' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className={`p-2.5 rounded-lg border shrink-0 ${getTypeStyle(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white leading-normal font-semibold">
                    {notif.content}
                  </p>
                  <span className="text-[9px] text-white/40 block">
                    {new Date(notif.createdAt).toLocaleDateString()} @ {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="p-1.5 bg-white/5 hover:bg-brandCyan/20 text-white/50 hover:text-brandCyan rounded-lg transition-all"
                  title="Mark as Read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
