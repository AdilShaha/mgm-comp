import React from 'react';
import { Sun, Moon, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import { UserProfile } from '../types/index.ts';

export type ActiveView = 'inspector' | 'audit' | 'consent' | 'history' | 'admin';

interface HeaderProps {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  isDarkMode,
  toggleDarkMode,
  user,
  onOpenAuthModal,
  onSignOut,
  isAdminLoggedIn,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => setCurrentView('inspector')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-base shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-none">
              DPDP Form Auditor
            </span>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight tracking-normal mt-0.5">
              India DPDP Compliance Engine
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Strictly NO Admin or Organizer links) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('inspector')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentView === 'inspector'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            Live X-Ray Inspector
          </button>

          <button
            onClick={() => setCurrentView('audit')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentView === 'audit'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            Compliance Audit
          </button>

          <button
            onClick={() => setCurrentView('consent')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentView === 'consent'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            Consent Notice Generator
          </button>

          <button
            onClick={() => setCurrentView('history')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
              currentView === 'history'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            Audit History
          </button>

          {isAdminLoggedIn && currentView === 'admin' && (
            <span className="ml-2 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              Admin Mode
            </span>
          )}
        </nav>

        {/* Zone 3: Actions (Theme Toggle & Account) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* User Auth Action */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
