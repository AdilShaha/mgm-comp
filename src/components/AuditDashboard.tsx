import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  BookmarkPlus,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  Check,
} from 'lucide-react';
import { AuditResult, FieldNecessity } from '../types/index.ts';

interface AuditDashboardProps {
  audit: AuditResult | null;
  onSaveAudit: () => void;
  isSaving: boolean;
  onNavigateToConsent: () => void;
  onNavigateToInspector: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  audit,
  onSaveAudit,
  isSaving,
  onNavigateToConsent,
  onNavigateToInspector,
  showToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!audit) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          No Form Audit Completed
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Please run a scan in the Live X-Ray Inspector first to view compliance metrics, excess collection flags, and statutory evaluation.
        </p>
        <button
          onClick={onNavigateToInspector}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-95"
        >
          <span>Open Live X-Ray Inspector</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Filter fields
  const filteredFields = audit.fields.filter(field => {
    const matchesFilter =
      filterStatus === 'all' || field.necessity === filterStatus;
    const matchesSearch =
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const downloadReport = () => {
    const reportText = `========================================================
DPDP ACT 2023 FORM COMPLIANCE AUDIT REPORT
========================================================
Form Title: ${audit.formTitle}
Specified Purpose: ${audit.purposeLabel} (${audit.purposeDescription})
Evaluation Date: ${new Date(audit.createdAt).toLocaleString()}
Overall Compliance Score: ${audit.complianceScore}/100 (${audit.status.toUpperCase()})

SUMMARY METRICS:
- Total Personal Data Fields: ${audit.totalFields}
- Essential Fields (DPDP Sec 6(1)): ${audit.essentialCount}
- Questionable Fields: ${audit.questionableCount}
- Excess Data Over-Collection: ${audit.excessCount}
- Minor / Children Data Present: ${audit.childrenDataPresent ? 'YES (HIGH RISK - SEC 9)' : 'NO'}
- Biometric Data Present: ${audit.biometricDataPresent ? 'YES' : 'NO'}

ITEMIZED FIELD AUDIT:
${audit.fields
  .map(
    (f, idx) => `
[${idx + 1}] ${f.label} (${f.name})
    Category: ${f.category.toUpperCase()} | Sensitivity: ${f.sensitivity.toUpperCase()}
    Status: ${f.necessity.toUpperCase()}
    Legal Basis: ${f.legalBasis}
    Finding: ${f.reason}
    Recommendation: ${f.recommendation}
`
  )
  .join('')}

========================================================
Prepared via DPDP Form Auditor Compliance Engine
========================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPDP_Audit_${audit.formTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Audit Report Exported', 'Downloaded comprehensive compliance report as text.');
  };

  const copySummary = () => {
    navigator.clipboard.writeText(
      `DPDP Form Audit: ${audit.formTitle} — Score ${audit.complianceScore}/100 (${audit.status}). Essential: ${audit.essentialCount}, Excess: ${audit.excessCount}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast('Summary Copied', 'Audit summary copied to clipboard.');
  };

  // SVG Circular progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (audit.complianceScore / 100) * circumference;

  const scoreColor =
    audit.complianceScore >= 85
      ? 'text-emerald-600 dark:text-emerald-400 stroke-emerald-600 dark:stroke-emerald-400'
      : audit.complianceScore >= 60
      ? 'text-amber-600 dark:text-amber-400 stroke-amber-600 dark:stroke-amber-400'
      : 'text-rose-600 dark:text-rose-400 stroke-rose-600 dark:stroke-rose-400';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {audit.formTitle}
            </h2>
            <span
              className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                audit.status === 'compliant'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : audit.status === 'warning'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {audit.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>Purpose: <strong className="text-zinc-700 dark:text-zinc-300">{audit.purposeLabel}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Audited: {new Date(audit.createdAt).toLocaleDateString()}</span>
            <span aria-hidden="true">·</span>
            <span>Digital Personal Data Protection Act, 2023</span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
            {audit.purposeDescription}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copySummary}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>Share</span>
          </button>

          <button
            onClick={downloadReport}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>

          <button
            onClick={onSaveAudit}
            disabled={isSaving}
            className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Audit'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics & Circular Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Circular Progress Gauge */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between sm:col-span-2 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Compliance Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {audit.complianceScore}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ 100</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[180px]">
              {audit.complianceScore >= 85
                ? 'High adherence to DPDP data minimization principles.'
                : audit.complianceScore >= 60
                ? 'Contains excess fields that must be justified or removed.'
                : 'Severe non-compliance risk under DPDP Section 6 & Section 9.'}
            </p>
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className={`transition-all duration-1000 ease-out ${scoreColor}`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold font-mono tabular-nums leading-none">
                {audit.complianceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Essential Fields */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Essential Data</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {audit.essentialCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Strictly necessary for stated purpose
            </p>
          </div>
        </div>

        {/* Metric 3: Questionable Fields */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Questionable</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {audit.questionableCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Requires explicit rationale
            </p>
          </div>
        </div>

        {/* Metric 4: Excess Collection */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Excess Collection</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {audit.excessCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Disproportionate over-collection
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Flags Banner (if high-risk child data or biometrics) */}
      {(audit.childrenDataPresent || audit.biometricDataPresent) && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-rose-900 dark:text-rose-200">
              High-Risk Statutory Data Elements Flagged
            </h4>
            <p className="text-rose-700 dark:text-rose-300">
              {audit.childrenDataPresent && (
                <span className="block">
                  • <strong>Section 9 Child Data Protection:</strong> Verifiable parental consent and prohibition of behavioral tracking are mandatory.
                </span>
              )}
              {audit.biometricDataPresent && (
                <span className="block">
                  • <strong>Biometric/Health Data:</strong> Strict security safeguards and specific explicit statutory justification are required.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Itemized Audit Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Field Classification & Legal Analysis
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              ({filteredFields.length} of {audit.totalFields})
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search fields or categories..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
            </div>

            {/* Segmented Filter Buttons */}
            <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {(['all', 'essential', 'questionable', 'excess'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors capitalize ${
                    filterStatus === tab
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-500 font-medium">
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Sensitivity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Statutory Basis</th>
                <th className="py-3 px-4">Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-sans">
              {filteredFields.map(field => {
                const isExcess = field.necessity === 'excess';
                const isEssential = field.necessity === 'essential';

                return (
                  <tr
                    key={field.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <span>{field.label}</span>
                        {field.isRequired && (
                          <span className="text-[10px] text-rose-500" title="Required field">*</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {field.name}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] uppercase text-zinc-600 dark:text-zinc-400">
                        {field.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded ${
                          field.sensitivity === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : field.sensitivity === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {field.sensitivity}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {isEssential && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Essential</span>
                          </span>
                        )}
                        {isExcess && (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Excess Data</span>
                          </span>
                        )}
                        {!isEssential && !isExcess && (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Questionable</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-xs">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200 text-[11px]">
                        {field.legalBasis}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                        {field.reason}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-xs text-[11px]">
                      {field.recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Step Callout */}
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-xs text-zinc-700 dark:text-zinc-300">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">
            Generate Section 5 Multilingual Consent Notice
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Prepare enforceable statutory consent notices in English, Hindi, and Marathi based on this audit.
          </p>
        </div>

        <button
          onClick={onNavigateToConsent}
          className="shrink-0 flex items-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>Open Consent Generator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
