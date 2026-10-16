import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Check,
  Globe,
  Settings2,
  Code,
  ShieldCheck,
  AlertCircle,
  Building2,
  Mail,
  User,
  MapPin,
} from 'lucide-react';
import { AuditResult } from '../types/index.ts';
import {
  generateConsentNotice,
  SupportedLanguage,
  ConsentNoticeDetails,
  DEFAULT_NOTICE_DETAILS,
} from '../lib/consentGenerator.ts';

interface ConsentNoticeViewProps {
  audit: AuditResult | null;
  onNavigateToInspector: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ConsentNoticeView: React.FC<ConsentNoticeViewProps> = ({
  audit,
  onNavigateToInspector,
  showToast,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const [noticeDetails, setNoticeDetails] = useState<ConsentNoticeDetails>(DEFAULT_NOTICE_DETAILS);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'text' | 'html'>('text');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!audit) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          No Form Audit Available
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Consent notices are generated specifically for the data attributes and purpose verified during a form audit. Please scan a form first.
        </p>
        <button
          onClick={onNavigateToInspector}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-95"
        >
          <span>Run Initial Scan</span>
        </button>
      </div>
    );
  }

  const generated = generateConsentNotice(audit, noticeDetails, selectedLang);

  const handleCopy = () => {
    const textToCopy = viewMode === 'text' ? generated.content : generated.htmlSnippet;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast('Notice Copied', `The ${generated.title} has been copied to your clipboard.`);
  };

  const handleDownload = () => {
    const content = viewMode === 'text' ? generated.content : generated.htmlSnippet;
    const extension = viewMode === 'text' ? 'txt' : 'html';
    const mime = viewMode === 'text' ? 'text/plain' : 'text/html';

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DPDP_Consent_Notice_${selectedLang.toUpperCase()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File Downloaded', `Saved notice as DPDP_Consent_Notice_${selectedLang.toUpperCase()}.${extension}`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Multilingual Consent Notice Generator
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              Section 5 DPDP Act 2023
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Compliant consent notice with purpose declaration, itemized data schedule, withdrawal procedures, and grievance redressal officer details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
              showConfig
                ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Fiduciary Details</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy Notice'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Text</span>
          </button>
        </div>
      </div>

      {/* Grievance & Fiduciary Config Drawer */}
      {showConfig && (
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Statutory Data Fiduciary & Grievance Redressal Officer Settings
            </h3>
            <span className="text-[11px] text-zinc-500">
              Required under DPDP Section 5(1)(ii) & Section 13
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Data Fiduciary Legal Entity Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={noticeDetails.organizationName}
                  onChange={e => setNoticeDetails({ ...noticeDetails, organizationName: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
                <Building2 className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Grievance Redressal Officer Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={noticeDetails.grievanceOfficerName}
                  onChange={e => setNoticeDetails({ ...noticeDetails, grievanceOfficerName: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
                <User className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Grievance Redressal Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={noticeDetails.grievanceOfficerEmail}
                  onChange={e => setNoticeDetails({ ...noticeDetails, grievanceOfficerEmail: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
                <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Registered Office Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={noticeDetails.grievanceAddress}
                  onChange={e => setNoticeDetails({ ...noticeDetails, grievanceAddress: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
                <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Tabs & View Format Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {/* Language Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <button
            onClick={() => setSelectedLang('en')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedLang === 'en'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>English (Official)</span>
          </button>

          <button
            onClick={() => setSelectedLang('hi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedLang === 'hi'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>हिन्दी (Hindi)</span>
          </button>

          <button
            onClick={() => setSelectedLang('mr')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedLang === 'mr'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>मराठी (Marathi)</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('text')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'text'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Notice Text</span>
          </button>
          <button
            onClick={() => setViewMode('html')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'html'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Web Embed Snippet</span>
          </button>
        </div>
      </div>

      {/* Notice Viewer Container */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
        {viewMode === 'text' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-mono text-zinc-500">
                Language: <strong>{generated.title}</strong>
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                DPDP Act 2023 Compliant Draft
              </span>
            </div>

            <pre className="font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-h-[600px] overflow-y-auto">
              {generated.content}
            </pre>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-mono text-zinc-500">
                HTML Embeddable Form Notice Snippet
              </span>
              <span className="text-xs text-zinc-400">
                Ready to paste above form submit button
              </span>
            </div>

            <pre className="font-mono text-xs text-emerald-800 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed p-4 rounded-xl bg-zinc-950 text-zinc-100 border border-zinc-800 max-h-[300px] overflow-y-auto">
              {generated.htmlSnippet}
            </pre>

            {/* Live Preview of HTML */}
            <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400">
                Rendered Preview:
              </span>
              <div
                dangerouslySetInnerHTML={{ __html: generated.htmlSnippet }}
                className="max-w-xl mx-auto"
              />
            </div>
          </div>
        )}
      </div>

      {/* DPDP Section 5 Statutory Compliance Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Section 5(1)(i) Itemized Data</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Categorized personal data items itemized clearly for transparency.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Section 5(1)(ii) Rights Procedure</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Plain-English explanation of access, correction, erasure, and nomination rights.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Section 6(4) Ease of Withdrawal</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Specifies exact contact and technical methods to withdraw consent with equal ease.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Section 13 Grievance Escalation</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Officer contact and statutory right to escalate to Data Protection Board of India.
          </p>
        </div>
      </div>
    </div>
  );
};
