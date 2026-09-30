import React from 'react';
import { Menu, Bell, Search, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleMobile, title = 'Dashboard' }) => {
  const { admin } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Semester 2026-27 Active</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
            {admin?.fullName ? admin.fullName.charAt(0) : 'A'}
          </div>
          <span className="hidden md:block text-xs font-semibold text-slate-700">
            {admin?.fullName || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
