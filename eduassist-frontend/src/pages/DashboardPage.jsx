import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Bot, FileText, CreditCard, Folder, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatCard, SkeletonCard, EmptyState, Skeleton } from '../components/ui/index.jsx';

const QUICK_ACTIONS = [
  { to: '/ai',  icon: Bot,       label: 'AI Study',   color: 'from-brand-500 to-brand-600',   sub: 'Generate MCQs & summaries' },
  { to: '/pdf', icon: FileText,  label: 'PDF Tools',  color: 'from-ocean-400 to-ocean-500',   sub: 'Merge, compress, convert' },
  { to: '/cv',  icon: CreditCard, label: 'CV Builder', color: 'from-emerald-400 to-emerald-500', sub: 'Build your resume' },
];

// Mock weekly chart data
const CHART_DATA = [
  { day: 'Mon', files: 2, sessions: 1 },
  { day: 'Tue', files: 5, sessions: 3 },
  { day: 'Wed', files: 3, sessions: 2 },
  { day: 'Thu', files: 7, sessions: 4 },
  { day: 'Fri', files: 4, sessions: 5 },
  { day: 'Sat', files: 6, sessions: 3 },
  { day: 'Sun', files: 8, sessions: 6 },
];

function ActivityItem({ item }) {
  const icons = { file: FileText, ai: Bot, cv: CreditCard };
  const colors = { file: 'text-ocean-400 bg-ocean-400/10', ai: 'text-brand-400 bg-brand-500/10', cv: 'text-emerald-400 bg-emerald-400/10' };
  const Icon = icons[item.type] || Folder;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors[item.type] || 'text-white/40 bg-white/5'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">{item.label}</p>
        <p className="text-xs text-white/30">{item.sub}</p>
      </div>
      <span className="text-xs text-white/20 shrink-0">{new Date(item.time).toLocaleDateString()}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.overview()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const activity = data?.activity || [];
  const storage = data?.storage || {};

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {greeting()}, {profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-muted mt-1 text-sm">Here's your productivity overview</p>
        </div>
        <Link to="/ai" className="btn-primary">
          <Bot className="w-4 h-4" /> New AI Session
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Files Processed" value={stats.totalFiles ?? 0} icon={Folder} color="brand" trend={{ positive: true, label: `${stats.weekFiles ?? 0} this week` }} />
            <StatCard label="AI Sessions" value={stats.totalAiSessions ?? 0} icon={Bot} color="ocean" trend={{ positive: true, label: `${stats.weekAiSessions ?? 0} this week` }} />
            <StatCard label="CVs Created" value={stats.totalCvs ?? 0} icon={CreditCard} color="emerald" />
            <StatCard
              label="Storage Used"
              value={`${storage.usedMB ?? 0} MB`}
              icon={Activity}
              color="gold"
              sub={`of ${storage.limitMB ?? 2048} MB`}
            />
          </>
        )}
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold">Weekly Activity</h3>
              <p className="text-xs text-muted mt-0.5">Files processed & AI sessions</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500" />Files</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ocean-400" />AI</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gFiles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5c9cfc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5c9cfc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="files" stroke="#7c5cfc" strokeWidth={2} fill="url(#gFiles)" />
              <Area type="monotone" dataKey="sessions" stroke="#5c9cfc" strokeWidth={2} fill="url(#gAI)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent Activity</h3>
            <TrendingUp className="w-4 h-4 text-white/30" />
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : activity.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" description="Start by uploading a PDF or using the AI assistant" />
          ) : (
            <div>{activity.slice(0, 6).map((item, i) => <ActivityItem key={i} item={item} />)}</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, color, sub }) => (
            <Link
              key={to}
              to={to}
              className="group glass glass-hover rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-muted mt-0.5">{sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
