import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bot, FileText, CreditCard, User,
  LogOut, Sparkles, X, HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ai',        icon: Bot,             label: 'AI Study' },
  { to: '/pdf',       icon: FileText,         label: 'PDF Tools' },
  { to: '/cv',        icon: CreditCard,       label: 'CV Builder' },
  { to: '/profile',   icon: User,             label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    navigate('/');
  }

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex flex-col
        bg-surface-2 border-r border-white/6
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg gradient-text-brand">EduAssist</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="pt-4 mt-4 border-t border-white/6">
          <a href="#" className="nav-item">
            <HelpCircle className="w-4 h-4 shrink-0" />
            Help & Support
          </a>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/6 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {(profile?.name || user?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.name || user?.displayName || 'User'}</p>
            <p className="text-xs text-white/40 truncate">{profile?.plan || 'free'} plan</p>
          </div>
          <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors p-1" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
