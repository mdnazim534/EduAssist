import React, { useState, useEffect } from 'react';
import {
  User, Moon, Sun, Bell, Trash2,
  HardDrive, Bot, Save, Check, AlertTriangle, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { filesAPI, aiAPI, authAPI } from '../api/client';
import { Spinner, ProgressBar, EmptyState, Skeleton } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        <h3 className="font-display font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '' });
  const [prefs, setPrefs] = useState({ emailNotifications: true, processingAlerts: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [storage, setStorage] = useState(null);
  const [storageLoading, setStorageLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const [aiSessions, setAiSessions] = useState([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', email: profile.email || '' });
      setPrefs(profile.preferences || { emailNotifications: true, processingAlerts: true });
    } else if (user) {
      setForm({ name: user.displayName || '', email: user.email || '' });
    }
  }, [profile, user]);

  useEffect(() => {
    filesAPI.storage()
      .then(setStorage)
      .catch(() => {})
      .finally(() => setStorageLoading(false));

    aiAPI.getHistory({ limit: 5 })
      .then((r) => setAiSessions(r.data || []))
      .catch(() => {})
      .finally(() => setAiLoading(false));
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await authAPI.updateProfile({ name: form.name, preferences: prefs });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClearTemp() {
    setClearing(true);
    try {
      const res = await filesAPI.clearTemp();
      toast.success(`Cleared ${res.deletedCount || 0} temp files`);
      const s = await filesAPI.storage();
      setStorage(s);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setClearing(false);
    }
  }

  async function handleDeleteSession(id) {
    try {
      await aiAPI.deleteSession(id);
      setAiSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success('Session deleted');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
    toast.success('Logged out');
  }

  const storagePercent = storage ? parseFloat(storage.percentUsed) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Profile</h1>
          <p className="text-muted text-sm mt-1">Manage your account and preferences</p>
        </div>
        <button onClick={handleLogout} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Avatar + plan */}
      <div className="glass rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {(profile?.name || user?.displayName || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-xl">{profile?.name || user?.displayName || 'User'}</p>
          <p className="text-muted text-sm">{profile?.email || user?.email}</p>
        </div>
        <span className={`badge ${profile?.plan === 'pro' ? 'badge-brand' : 'badge-green'} text-sm px-3 py-1`}>
          {profile?.plan === 'pro' ? '✦ Pro' : 'Free'}
        </span>
      </div>

      {/* Profile form */}
      <SectionCard title="Account Details" icon={User}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input value={form.email} disabled className="input opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance & Notifications" icon={theme === 'dark' ? Moon : Sun}>
        <Toggle checked={theme === 'dark'} onChange={toggleTheme} label="Dark Mode" sub="Use dark theme across the app" />
        <Toggle checked={prefs.emailNotifications} onChange={(v) => setPrefs((p) => ({ ...p, emailNotifications: v }))} label="Email Notifications" sub="Receive processing and update emails" />
        <Toggle checked={prefs.processingAlerts} onChange={(v) => setPrefs((p) => ({ ...p, processingAlerts: v }))} label="Processing Alerts" sub="Get notified when files are ready" />
      </SectionCard>

      {/* Storage */}
      <SectionCard title="Storage" icon={HardDrive}>
        {storageLoading ? <Skeleton className="h-16" /> : storage ? (
          <div className="space-y-4">
            <ProgressBar value={storagePercent} label={`${storage.usedMB} MB of ${storage.limitMB} MB used`} />
            <button onClick={handleClearTemp} disabled={clearing} className="btn-secondary">
              {clearing ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
              Clear Temporary Files
            </button>
          </div>
        ) : <p className="text-muted text-sm">Storage info unavailable</p>}
      </SectionCard>

      {/* AI History */}
      <SectionCard title="Recent AI Sessions" icon={Bot}>
        {aiLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : aiSessions.length === 0 ? (
          <EmptyState icon={Bot} title="No sessions yet" description="Your AI study sessions will appear here" />
        ) : (
          <div className="space-y-2">
            {aiSessions.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-3 glass-sm rounded-xl border border-white/6">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{s.title}</p>
                  <p className="text-xs text-white/30">{s.requestedTypes?.join(' · ')} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDeleteSession(s._id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Danger Zone" icon={AlertTriangle}>
        <p className="text-sm text-white/50 mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        {!deleteConfirm ? (
          <button onClick={() => setDeleteConfirm(true)} className="btn-secondary border-red-500/20 text-red-400 hover:border-red-500/40 hover:bg-red-500/5">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => toast.error('Please confirm from your email first')} className="btn-primary bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600">
              Confirm Delete
            </button>
            <button onClick={() => setDeleteConfirm(false)} className="btn-ghost">Cancel</button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
