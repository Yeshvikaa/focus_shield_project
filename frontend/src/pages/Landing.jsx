import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Award, LineChart, BookOpen, UserCheck, Flame } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-darkBg text-brandText">
      {/* Decorative Glow Nodes */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brandPurple/10 rounded-full blur-3xl pulse-glow -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brandCyan/10 rounded-full blur-3xl pulse-glow -z-10" style={{ animationDelay: '2.5s' }}></div>

      {/* Header / Nav */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brandBlue/10 text-brandCyan rounded-lg border border-brandCyan/20 shadow-glass-cyan">
            <Shield size={20} />
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-brandBlue to-brandCyan bg-clip-text text-transparent">
            FOCUS SHIELD
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold hover:text-brandCyan transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-brandBlue to-brandCyan rounded-xl shadow-glass-cyan hover:opacity-90 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full text-xs font-semibold text-brandCyan mb-6 animate-pulse shadow-inner">
          <Flame size={14} className="text-orange-500 fill-orange-500" /> Version 2.0: Optimized Learning Loop
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          Focus Better. <br />
          <span className="bg-gradient-to-r from-brandBlue via-brandCyan to-brandPurple bg-clip-text text-transparent">
            Learn Smarter.
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
          The futuristic educational productivity ecosystem that gamifies PDF reading, checks test responses, and monitors browser focus for students, parents, and teachers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/signup"
            className="px-8 py-4 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-extrabold rounded-2xl shadow-glass-cyan hover:shadow-cyan-500/20 hover:opacity-95 transition-all text-base"
          >
            Create Your Shield Account
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all text-base"
          >
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Equipped with Advanced Learning Protocols</h2>
          <p className="text-xs sm:text-sm text-white/40 mt-2">Designed to stop procrastination and track achievements in real-time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brandCyan/20 hover:shadow-glass-cyan transition-all group">
            <div className="p-3 bg-brandBlue/10 text-brandCyan rounded-xl border border-brandCyan/20 w-fit mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Discipline Study Loop</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Enforces a strict flow. You must study the PDF guide for a designated countdown timer before unlocking the quiz. Fails reset study logs.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brandBlue/20 hover:shadow-glass-blue transition-all group">
            <div className="p-3 bg-brandBlue/10 text-brandBlue rounded-xl border border-brandBlue/20 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Focus Lock</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Monitors active windows and tabs. Tab-switches or window blurs generate alerts, terminating sessions on the third warning.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brandPurple/20 hover:shadow-glass-purple transition-all group">
            <div className="p-3 bg-brandPurple/10 text-brandPurple rounded-xl border border-brandPurple/20 w-fit mb-4 group-hover:scale-110 transition-transform">
              <UserCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Parent Monitoring</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Grants parents direct access to study hours, quiz scores, level progressions, and detailed logs of tab violation alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30 relative z-10">
        <p>&copy; {new Date().getFullYear()} Focus Shield. Built for Futuristic Productivity.</p>
      </footer>
    </div>
  );
};

export default Landing;
