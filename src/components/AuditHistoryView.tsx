import React from 'react';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AuditResult } from '../types/index.ts';

interface AuditHistoryViewProps {
  history: AuditResult[];
  onSelectAudit: (audit: AuditResult) => void;
  onDeleteAudit: (id: string) => void;
  onClearAll?: () => void;
  onNavigateToInspector: () => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({
  history,
  onSelectAudit,
  onDeleteAudit,
  onClearAll,
  onNavigateToInspector,
}) => {
  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          No Saved Audits Found
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Audit reports you save will appear here. Run your first form scan in the Live X-Ray Inspector to begin tracking DPDP compliance scores.
        </p>
        <button
          onClick={onNavigateToInspector}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-95"
        >
          <span>Run New Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Audit History & Compliance Records
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              {history.length} Saved Records
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Historical logs of web form audits, statutory scores, and excess personal data assessments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={onNavigateToInspector}
            className="flex items-center gap-2 py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Form Audit</span>
          </button>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map(item => {
          const isHighRisk = item.complianceScore < 60;
          const isWarning = item.complianceScore >= 60 && item.complianceScore < 85;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {item.formTitle}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isHighRisk
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.complianceScore}/100
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{item.purposeLabel}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-zinc-400">Total</span>
                    <span className="font-mono font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                      {item.totalFields}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-600">Essential</span>
                    <span className="font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {item.essentialCount}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-rose-600">Excess</span>
                    <span className="font-mono font-bold tabular-nums text-rose-700 dark:text-rose-400">
                      {item.excessCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => onDeleteAudit(item.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete record"
                  aria-label="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectAudit(item)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors"
                >
                  <span>Open Audit</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
