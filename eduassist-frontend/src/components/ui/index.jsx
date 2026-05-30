import React from 'react';
import { Loader2, InboxIcon } from 'lucide-react';

/* ── Spinner ─────────────────────────────────────────────────────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`${sizes[size]} animate-spin text-brand-400 ${className}`} />;
}

export function FullSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

/* ── Progress Bar ────────────────────────────────────────────────────────── */
export function ProgressBar({ value = 0, label, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs text-white/50 mb-1.5">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-ocean-400 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon = InboxIcon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/20" />
      </div>
      <h3 className="font-display font-semibold text-white/60 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/30 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────────────────────── */
export function StatCard({ label, value, sub, icon: Icon, color = 'brand', trend }) {
  const colorMap = {
    brand:   'from-brand-500/20 to-brand-600/5 border-brand-500/20',
    ocean:   'from-ocean-400/20 to-ocean-500/5 border-ocean-400/20',
    emerald: 'from-emerald-400/20 to-emerald-500/5 border-emerald-400/20',
    gold:    'from-yellow-400/20 to-yellow-500/5 border-yellow-400/20',
  };
  const iconColor = {
    brand: 'text-brand-400', ocean: 'text-ocean-400',
    emerald: 'text-emerald-400', gold: 'text-yellow-400',
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${colorMap[color]} transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Icon className={`w-5 h-5 ${iconColor[color]}`} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tab bar ─────────────────────────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center
            ${active === tab.id
              ? 'bg-brand-500 text-white shadow-glow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Copy Button ─────────────────────────────────────────────────────────── */
export function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className={`btn-ghost text-xs py-1 px-2 ${className}`}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="glass p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
