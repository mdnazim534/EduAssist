import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-500/6 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-ocean-400/6 blur-[80px]" />
      </div>
      <div className="relative text-center">
        <div className="font-display text-[10rem] font-black leading-none gradient-text opacity-20 select-none">404</div>
        <div className="-mt-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-ocean-400 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Page not found</h1>
          <p className="text-muted mb-8 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
