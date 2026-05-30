import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const PERKS = [
  'AI-generated summaries & MCQs',
  'PDF merge, compress & convert',
  'ATS-friendly CV builder',
  'Secure file storage',
];

export default function RegisterPage() {
  const { register, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await loginGoogle();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-500/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-ocean-400/6 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center animate-fade-in">
        {/* Left - perks */}
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text-brand">EduAssist</span>
          </Link>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
            Everything you need to <span className="gradient-text">ace your studies</span>
          </h2>
          <p className="text-white/40 mb-8">Join 50,000+ students who study smarter with EduAssist.</p>
          <div className="space-y-4">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-white/70">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - form */}
        <div className="glass rounded-2xl p-7 space-y-5">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-white/40 text-sm">Free forever. No credit card needed.</p>
          </div>

          <button onClick={handleGoogle} className="btn-secondary w-full justify-center py-2.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className="input pl-9" placeholder="Alex Johnson" />
              </div>
            </div>
            <div>
              <label className="input-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="input pl-9" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={(e) => set('password', e.target.value)} className="input pl-9 pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
