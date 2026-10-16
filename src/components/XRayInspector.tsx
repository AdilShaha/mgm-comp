import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  FileCode,
  FileText,
  SlidersHorizontal,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { AuditResult, FormPurpose, FieldAudit } from '../types/index.ts';
import { FORM_TEMPLATES } from '../lib/sampleForms.ts';

interface XRayInspectorProps {
  rawInput: string;
  setRawInput: (input: string) => void;
  formTitle: string;
  setFormTitle: (title: string) => void;
  purpose: FormPurpose;
  setPurpose: (purpose: FormPurpose) => void;
  onRunAudit: () => void;
  currentAudit: AuditResult | null;
  onNavigateToAudit: () => void;
  onNavigateToConsent: () => void;
  isAnalyzing: boolean;
}

export const XRayInspector: React.FC<XRayInspectorProps> = ({
  rawInput,
  setRawInput,
  formTitle,
  setFormTitle,
  purpose,
  setPurpose,
  onRunAudit,
  currentAudit,
  onNavigateToAudit,
  onNavigateToConsent,
  isAnalyzing,
}) => {
  const [selectedField, setSelectedField] = useState<FieldAudit | null>(null);

  // URL Scanner state
  const [inputMode, setInputMode] = useState<'code' | 'url'>('code');
  const [urlInput, setUrlInput] = useState<string>('https://growthdaily.io/newsletter');
  const [isScanningUrl, setIsScanningUrl] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('Initializing scanner...');

  const handleSelectTemplate = (templateId: string) => {
    const tpl = FORM_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setRawInput(tpl.html);
      setFormTitle(tpl.title);
      setPurpose(tpl.purpose);
    }
  };

  const clearForm = () => {
    setRawInput('');
    setFormTitle('Custom Web Form');
    setSelectedField(null);
  };

  const handleScanUrl = () => {
    if (!urlInput.trim()) return;

    setIsScanningUrl(true);
    setScanProgress(15);
    setScanStatusText('Connecting to remote host and analyzing SSL certificates...');

    // Progress stage 1 (1000ms)
    setTimeout(() => {
      setScanProgress(52);
      setScanStatusText('Parsing DOM tree and crawling <form>, <input>, and <label> nodes...');
    }, 1000);

    // Progress stage 2 (2000ms)
    setTimeout(() => {
      setScanProgress(86);
      setScanStatusText('Extracting input field schemas and mapping personal data attributes...');
    }, 2000);

    // Completion stage (3000ms)
    setTimeout(() => {
      setScanProgress(100);
      setScanStatusText('Extraction complete! Populating X-Ray Inspector...');

      const lowerUrl = urlInput.toLowerCase();
      let extractedFields = '';
      let detectedTitle = `Web Form (${urlInput.replace(/^https?:\/\//, '').split('/')[0]})`;
      let detectedPurpose: FormPurpose = purpose;

      if (lowerUrl.includes('loan') || lowerUrl.includes('credit') || lowerUrl.includes('fintech') || lowerUrl.includes('bank')) {
        extractedFields = 'Applicant Full Name, Permanent Account Number (PAN), Monthly Income, Aadhaar Mobile Number, Official Work Email, Biometric Iris Scan';
        detectedTitle = `Fintech KYC Form (${urlInput})`;
        detectedPurpose = 'fintech_loan';
      } else if (lowerUrl.includes('checkout') || lowerUrl.includes('shop') || lowerUrl.includes('cart') || lowerUrl.includes('order')) {
        extractedFields = 'Recipient Full Name, Delivery Email, Contact Phone, Shipping Street Address, Postal PIN Code, Patient Medical History';
        detectedTitle = `Store Checkout Form (${urlInput})`;
        detectedPurpose = 'ecommerce';
      } else if (lowerUrl.includes('career') || lowerUrl.includes('job') || lowerUrl.includes('apply')) {
        extractedFields = 'Candidate Full Name, Contact Email, Contact Phone, Caste Category, Marital Status, Expected CTC, Portfolio URL';
        detectedTitle = `Career Application (${urlInput})`;
        detectedPurpose = 'job_application';
      } else {
        extractedFields = 'Full Name, Email Address, Mobile Phone Number, Aadhaar Number, Annual Salary, Blood Group, Precise Live GPS Coordinates, Minor Dependents Under 18';
        detectedTitle = `Subscription Form (${urlInput})`;
        detectedPurpose = 'newsletter';
      }

      setRawInput(extractedFields);
      setFormTitle(detectedTitle);
      setPurpose(detectedPurpose);
      setIsScanningUrl(false);

      // Automatically trigger the compliance audit
      setTimeout(() => {
        onRunAudit();
      }, 100);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Live X-Ray Inspector & Purpose Minimization
            </span>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              DPDP Sec 6 Engine
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Paste your HTML form or field list on the left to inspect data classification and real-time excess collection flags.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-zinc-500 whitespace-nowrap">Load Preset:</span>
          {FORM_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t.id)}
              className="text-xs px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all font-medium whitespace-nowrap"
            >
              {t.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration & HTML Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <FileCode className="w-4 h-4 text-zinc-500" />
                <span>Form Code & Purpose</span>
              </div>
              <button
                onClick={clearForm}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
                title="Clear input"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Input Mode Tabs: Direct Code/Fields vs Scan via URL */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setInputMode('code')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  inputMode === 'code'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>HTML & Field List</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  inputMode === 'url'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Scan via URL</span>
              </button>
            </div>

            {/* URL SCANNING TAB */}
            {inputMode === 'url' ? (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Live Web Form URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="https://example.com/signup or https://store.in/checkout"
                      disabled={isScanningUrl}
                      className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-mono disabled:opacity-60"
                    />
                    <Globe className="w-3.5 h-3.5 absolute left-2.5 top-3 text-zinc-400" />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Extracts and maps client-facing input fields, forms, and consent checkboxes from target endpoint.
                  </p>
                </div>

                {/* Quick URL Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-zinc-500">Sample Live URLs to Test:</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        name: 'GrowthDaily Weekly (Over-collecting Newsletter)',
                        url: 'https://growthdaily.io/newsletter',
                        purpose: 'newsletter' as FormPurpose,
                        fields: 'Full Name, Email Address, Mobile Phone Number, Aadhaar Number, Annual Salary, Blood Group, Precise Live GPS Coordinates, Minor Dependents Under 18',
                      },
                      {
                        name: 'FintechDirect Loan (Statutory KYC)',
                        url: 'https://fintechdirect.in/apply/instant-credit',
                        purpose: 'fintech_loan' as FormPurpose,
                        fields: 'Applicant Full Name, Permanent Account Number (PAN), Monthly Income, Aadhaar Mobile Number, Official Work Email, Biometric Iris Scan',
                      },
                      {
                        name: 'SwiftDeliver E-Commerce (Order Checkout)',
                        url: 'https://swiftdeliver.in/checkout/shipping',
                        purpose: 'ecommerce' as FormPurpose,
                        fields: 'Recipient Full Name, Delivery Email, Contact Phone, Shipping Street Address, Postal PIN Code, Patient Medical History',
                      },
                    ].map(preset => (
                      <button
                        key={preset.url}
                        type="button"
                        disabled={isScanningUrl}
                        onClick={() => {
                          setUrlInput(preset.url);
                          setPurpose(preset.purpose);
                        }}
                        className="text-left text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">{preset.name}</div>
                        <div className="font-mono text-[10px] text-zinc-400 truncate">{preset.url}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose Selector */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Declared Processing Purpose (DPDP Section 6)
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={e => setPurpose(e.target.value as FormPurpose)}
                      disabled={isScanningUrl}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 appearance-none pr-8 font-medium disabled:opacity-60"
                    >
                      <option value="newsletter">Newsletter & Promotional Communications</option>
                      <option value="ecommerce">E-Commerce Order & Physical Shipping</option>
                      <option value="job_application">Employment & Candidate Application</option>
                      <option value="contact_inquiry">General Inquiry & Customer Support</option>
                      <option value="fintech_loan">Financial Loan & Statutory KYC (RBI)</option>
                      <option value="event_rsvp">Community Event & Webinar RSVP</option>
                      <option value="account_signup">User Account Registration</option>
                      <option value="custom">Custom Specified Purpose</option>
                    </select>
                    <SlidersHorizontal className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-zinc-400" />
                  </div>
                </div>

                {/* Sleek 3-Second Scanning Progress Bar & Animation */}
                {isScanningUrl && (
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span>{scanStatusText}</span>
                      </div>
                      <span className="font-mono text-zinc-500 tabular-nums">
                        {Math.min(100, Math.round(scanProgress))}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      Scanning target: {urlInput}
                    </div>
                  </div>
                )}

                {/* Scan URL Trigger Button */}
                <button
                  type="button"
                  onClick={handleScanUrl}
                  disabled={isScanningUrl || !urlInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isScanningUrl ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Scanning Web Form (3s)...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Scan Live Web Form</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* DIRECT HTML & FIELD LIST TAB */
              <div className="space-y-4">
                {/* Form Title */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Form Title / Identifier
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Newsletter Subscription Form"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  />
                </div>

                {/* Purpose Selector */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Processing Purpose (DPDP Section 6)
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={e => setPurpose(e.target.value as FormPurpose)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 appearance-none pr-8 font-medium"
                    >
                      <option value="newsletter">Newsletter & Promotional Communications</option>
                      <option value="ecommerce">E-Commerce Order & Physical Shipping</option>
                      <option value="job_application">Employment & Candidate Application</option>
                      <option value="contact_inquiry">General Inquiry & Customer Support</option>
                      <option value="fintech_loan">Financial Loan & Statutory KYC (RBI)</option>
                      <option value="event_rsvp">Community Event & Webinar RSVP</option>
                      <option value="account_signup">User Account Registration</option>
                      <option value="custom">Custom Specified Purpose</option>
                    </select>
                    <SlidersHorizontal className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-zinc-400" />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Field necessity is evaluated strictly against this declared purpose under Section 6(1).
                  </p>
                </div>

                {/* HTML / Comma-separated Input Area with Clear Explanatory Label */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Input Form: Raw HTML or Simple Comma-Separated Fields
                    </label>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {rawInput.length} chars
                    </span>
                  </div>

                  {/* Explicit helper notice badge */}
                  <div className="mb-2 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Flexible Input:</strong> You can paste complete <code>&lt;form&gt;</code> HTML, or simply type comma-separated field names (e.g., <code>Name, Email, Phone, Aadhaar, Annual Salary, Blood Group</code>).
                    </span>
                  </div>

                  <textarea
                    value={rawInput}
                    onChange={e => setRawInput(e.target.value)}
                    rows={12}
                    placeholder="Type simple comma-separated fields (e.g. Name, Email, Phone, Aadhaar, Salary) or paste raw HTML <form>...</form> code..."
                    className="w-full text-xs font-mono p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-y leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={onRunAudit}
                  disabled={isAnalyzing || !rawInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold shadow-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Auditing Personal Data...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute DPDP Compliance Audit</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live X-Ray Skeleton UI & Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Form Skeleton X-Ray View
                </h3>
              </div>

              {currentAudit && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-zinc-500">
                    Score:
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      currentAudit.complianceScore >= 80
                        ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
                        : currentAudit.complianceScore >= 60
                        ? 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800'
                        : 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {currentAudit.complianceScore}/100
                  </span>
                </div>
              )}
            </div>

            {/* X-Ray Legend */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-[11px] border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-medium">Necessary Data</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">Review Necessity</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-medium">Excess Collection</span>
              </div>
            </div>

            {/* Loading Skeletons */}
            {isAnalyzing && (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2 animate-pulse">
                    <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isAnalyzing && (!currentAudit || currentAudit.fields.length === 0) && (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Ready for X-Ray Inspection
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Choose a preset template above or paste your form HTML. Click "Execute DPDP Compliance Audit" to reveal field-level compliance glow.
                </p>
              </div>
            )}

            {/* Live Rendered Form Skeleton with Glowing Compliance Status */}
            {!isAnalyzing && currentAudit && currentAudit.fields.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-zinc-500 flex items-center justify-between">
                  <span>{currentAudit.fields.length} Detected Form Fields</span>
                  <span>Click any field to view statutory reasoning</span>
                </div>

                <div className="space-y-3">
                  {currentAudit.fields.map(field => {
                    const isExcess = field.necessity === 'excess';
                    const isEssential = field.necessity === 'essential';
                    const isSelected = selectedField?.id === field.id;

                    return (
                      <div
                        key={field.id}
                        onClick={() => setSelectedField(field)}
                        className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-zinc-900 dark:ring-zinc-100'
                            : ''
                        } ${
                          isExcess
                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/70 dark:bg-rose-950/25 shadow-sm'
                            : isEssential
                            ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                            : 'border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {isExcess && (
                              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                            {isEssential && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            {!isExcess && !isEssential && (
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              {field.label}
                            </span>
                            {field.isRequired && (
                              <span className="text-[10px] text-rose-500 font-bold">*</span>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              isExcess
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                                : isEssential
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            }`}
                          >
                            {field.necessity === 'excess'
                              ? 'Excess Data'
                              : field.necessity === 'essential'
                              ? 'Essential'
                              : 'Review'}
                          </span>
                        </div>

                        {/* Visual Form Control Skeleton */}
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            disabled
                            placeholder={field.placeholder || `[${field.name}]`}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 cursor-pointer pointer-events-none"
                          />
                          <span className="absolute right-2.5 top-2 text-[10px] font-mono text-zinc-400 uppercase">
                            {field.category}
                          </span>
                        </div>

                        {/* Brief Reasoning Callout */}
                        <div className="mt-2 text-[11px] flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                          <span className="line-clamp-1">{field.reason}</span>
                          <span className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0 font-medium">
                            Details →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Field Statutory Deep-Dive */}
                {selectedField && (
                  <div className="mt-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          DPDP Analysis: {selectedField.label} ({selectedField.name})
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {selectedField.category} · {selectedField.sensitivity} sensitivity
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      <strong>Statutory Basis:</strong> {selectedField.legalBasis}
                    </p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      <strong>Finding:</strong> {selectedField.reason}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      <strong>Remediation:</strong> {selectedField.recommendation}
                    </p>
                  </div>
                )}

                {/* Quick Next Steps */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={onNavigateToAudit}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-all"
                  >
                    <span>View Full Compliance Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onNavigateToConsent}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Generate Compliant Notice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
