import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../api/client';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/ai':        'AI Study Assistant',
  '/pdf':       'PDF Tools',
  '/cv':        'CV Builder',
  '/profile':   'My Profile',
};

export default function TopBar({ onMenuClick }) {
  const { theme, toggle } = useTheme();
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e) {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await dashboardAPI.search(q);
      setResults(res.results || []);
    } catch (_) {} finally {
      setSearching(false);
    }
  }

  return (
    <header className="h-16 shrink-0 border-b border-white/6 bg-surface-2/80 backdrop-blur-md flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden text-white/60 hover:text-white">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="font-display font-semibold text-lg hidden sm:block">
        {PAGE_TITLES[pathname] || 'EduAssist'}
      </h1>

      {/* Search */}
      <div className="relative flex-1 max-w-md ml-auto sm:ml-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search files, sessions…"
          className="input pl-9 py-2 text-sm"
        />
        {results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 glass rounded-xl shadow-card z-50 overflow-hidden">
            {results.slice(0, 5).map((r, i) => (
              <div key={i} className="px-3 py-2 text-sm hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
                <p className="text-white/90">{r.label}</p>
                <p className="text-white/40 text-xs">{r.type} · {r.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-2" title="Notifications">
          <Bell className="w-4 h-4" />
        </button>
        <button onClick={toggle} className="btn-ghost p-2" title="Toggle theme">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          {(profile?.name || user?.displayName || 'U')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
