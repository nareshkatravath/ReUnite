import React from 'react';
import { Menu, Info, ShieldCheck, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  onGoHome: () => void;
  onOpenInfo: () => void;
  activeScreen: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onGoHome, onOpenInfo }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          id="nav-brand-button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-90 transition-opacity text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-inner font-black text-lg">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg font-extrabold tracking-wide">ReuniteApp</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Community
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              Lost & Found Person Directory
            </p>
          </div>
        </button>

        {/* Info & Badges */}
        <div className="flex items-center gap-2">
          <button
            id="nav-info-button"
            onClick={onOpenInfo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors shadow-sm active:scale-95"
            title="About ReuniteApp & Emergency Helplines"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Directory Info</span>
            <span className="sm:hidden">Info</span>
          </button>
        </div>
      </div>
    </header>
  );
};
