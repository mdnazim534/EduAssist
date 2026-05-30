import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Bot, CreditCard, ArrowRight, Star, Zap, Shield, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: Bot,        color: 'from-brand-500 to-brand-600',   title: 'AI Study Assistant',    desc: 'Upload PDFs or paste notes. Get summaries, MCQs, viva questions, and key topics in seconds.' },
  { icon: FileText,   color: 'from-ocean-400 to-ocean-500',   title: 'PDF Tools',             desc: 'Merge, compress, convert images to PDF. All in your browser, no signup needed.' },
  { icon: CreditCard, color: 'from-emerald-400 to-emerald-500', title: 'CV Builder',          desc: 'ATS-friendly CV templates with live preview and one-click PDF export.' },
  { icon: Zap,        color: 'from-yellow-400 to-orange-400', title: 'Lightning Fast',        desc: 'Results in seconds, not minutes. Optimized for speed at every step.' },
  { icon: Shield,     color: 'from-pink-500 to-rose-500',     title: 'Private & Secure',      desc: 'Your files are encrypted and auto-deleted after 24 hours.' },
  { icon: Globe,      color: 'from-purple-500 to-brand-600',  title: 'Works Everywhere',      desc: 'Fully responsive. Use on desktop, tablet, or phone.' },
];

const STATS = [
  { label: 'Students', value: '50K+' },
  { label: 'Docs Processed', value: '2M+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Rating', value: '4.9 ★' },
];

function NavBar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface/90 backdrop-blur-xl border-b border-white/6' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text-brand">EduAssist</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="btn-ghost p-2">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-ocean-400/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Nazim
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-[1.05] mb-6 animate-slide-up">
            Study Smarter with{' '}
            <span className="gradient-text">AI-Powered</span>{' '}
            Tools
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Transform documents into insights. Generate summaries, quizzes, and build a stunning CV — all in one platform built for modern learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary text-base px-7 py-3 shadow-glow-brand">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-7 py-3">
              Sign In
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-white/30 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex -space-x-2">
              {['#7c5cfc','#5c9cfc','#5cfcd8','#fc5c9c'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-surface" style={{ background: c }} />
              ))}
            </div>
            <span>Trusted by <strong className="text-white/60">50,000+</strong> students</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/6 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl font-bold gradient-text">{value}</p>
              <p className="text-sm text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold mb-3">Everything You Need</h2>
            <p className="text-white/40 text-lg">One platform. Every tool a student needs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="feature-card group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 border-brand-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-ocean-400/10 pointer-events-none" />
            <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold mb-3">Ready to Study Smarter?</h2>
            <p className="text-white/50 mb-7">Join 50,000+ students already using EduAssist.</p>
            <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-glow-brand">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 py-8 px-4 text-center text-sm text-white/30">
        © {new Date().getFullYear()} EduAssist · Built with ❤️ for students everywhere
      </footer>
    </div>
  );
}
