import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdminModal: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminModal, isAdminLoggedIn }) => {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 py-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span>Digital Personal Data Protection Act, 2023 (DPDP Act) Reference Tool</span>
          <span aria-hidden="true" className="text-zinc-400">·</span>
          <span>Data Minimization & Notice Compliance</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-500">
          <span>Statutory Compliance Architecture</span>
          <span aria-hidden="true" className="text-zinc-400">·</span>
          <span>Zero-Telemetry Local Evaluation</span>

          {/* SECRET TRIGGER: Extreme bottom-right corner tiny subtle Lucide Lock icon */}
          <button
            onClick={onOpenAdminModal}
            className={`p-1.5 rounded transition-all duration-300 ${
              isAdminLoggedIn
                ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                : 'text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-400'
            }`}
            title="System Security Verification"
            aria-label="Security Portal"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
