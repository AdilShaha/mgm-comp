import React, { useState, useEffect } from 'react';
import { Header, ActiveView } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ToastContainer } from './components/Toast.tsx';
import { XRayInspector } from './components/XRayInspector.tsx';
import { AuditDashboard } from './components/AuditDashboard.tsx';
import { ConsentNoticeView } from './components/ConsentNoticeView.tsx';
import { AuditHistoryView } from './components/AuditHistoryView.tsx';
import { AdminModal } from './components/AdminModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { UserAuthModal } from './components/UserAuthModal.tsx';
import {
  AuditResult,
  FormPurpose,
  ComplianceDictionaryRule,
  ToastMessage,
  UserProfile,
} from './types/index.ts';
import { runDpdPAudit } from './lib/parserEngine.ts';
import { FORM_TEMPLATES } from './lib/sampleForms.ts';
import {
  fetchDictionaryRules,
  createDictionaryRule,
  deleteDictionaryRule,
  saveAuditLogToDb,
  fetchAuditLogsFromDb,
  deleteAuditLogFromDb,
  deleteDummyAuditsFromDb,
} from './lib/supabase.ts';

export default function App() {
  // Navigation State (STRICT simple React state)
  const [currentView, setCurrentView] = useState<ActiveView>('inspector');

  // Dark Mode Toggle State (Light mode default strictly enforced)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Form Input State
  const [rawInput, setRawInput] = useState<string>(FORM_TEMPLATES[0].html);
  const [formTitle, setFormTitle] = useState<string>(FORM_TEMPLATES[0].title);
  const [purpose, setPurpose] = useState<FormPurpose>(FORM_TEMPLATES[0].purpose);

  // Audit State
  const [currentAudit, setCurrentAudit] = useState<AuditResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // History & Rules State
  const [auditHistory, setAuditHistory] = useState<AuditResult[]>([]);
  const [dictionaryRules, setDictionaryRules] = useState<ComplianceDictionaryRule[]>([]);

  // Auth States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Enforce Light Mode and restore saved session on initial load
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      const savedUser = localStorage.getItem('dpdp_auditor_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // non-fatal
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Load rules & history from Supabase silently on start
  useEffect(() => {
    async function loadInitialData() {
      // Clean up any previously seeded dummy/demo audits
      try {
        await deleteDummyAuditsFromDb();
      } catch {
        // silent
      }

      try {
        const rules = await fetchDictionaryRules();
        if (rules && rules.length > 0) {
          setDictionaryRules(rules);
        }
      } catch {
        // silent
      }

      try {
        const logs = await fetchAuditLogsFromDb(user?.id);
        if (logs) {
          setAuditHistory(logs.filter(l => !l.id?.startsWith('audit_demo_')));
        }
      } catch {
        // silent
      }
    }
    loadInitialData();
  }, [user]);

  // Execute initial audit for the default form on mount
  useEffect(() => {
    const initialResult = runDpdPAudit(
      FORM_TEMPLATES[0].html,
      FORM_TEMPLATES[0].purpose,
      FORM_TEMPLATES[0].title,
      dictionaryRules
    );
    setCurrentAudit(initialResult);
  }, []);

  // Trigger DPDP Audit
  const handleRunAudit = () => {
    if (!rawInput.trim()) {
      showToast('Input Required', 'Please provide HTML form code or field names.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = runDpdPAudit(rawInput, purpose, formTitle, dictionaryRules);
      setCurrentAudit(result);
      setIsAnalyzing(false);

      if (result.complianceScore >= 85) {
        showToast('Audit Complete', `Compliant Form: Score ${result.complianceScore}/100`, 'success');
      } else if (result.complianceScore >= 60) {
        showToast('Audit Complete', `Warning Flags Detected: Score ${result.complianceScore}/100`, 'warning');
      } else {
        showToast('Audit Complete', `Excess Collection Detected: Score ${result.complianceScore}/100`, 'error');
      }
    }, 500);
  };

  // Save Audit to Database & History
  const handleSaveAudit = async () => {
    if (!currentAudit) return;
    setIsSaving(true);
    try {
      await saveAuditLogToDb(currentAudit, user?.id);
      setAuditHistory(prev => [currentAudit, ...prev.filter(a => a.id !== currentAudit.id)]);
      showToast('Audit Saved', 'Compliance report saved to audit history.', 'success');
    } catch {
      // Still keep in session history
      setAuditHistory(prev => [currentAudit, ...prev.filter(a => a.id !== currentAudit.id)]);
      showToast('Audit Saved', 'Compliance report saved to audit history.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Audit from History
  const handleDeleteAudit = async (id: string) => {
    try {
      await deleteAuditLogFromDb(id);
    } catch {
      // silent
    }
    setAuditHistory(prev => prev.filter(a => a.id !== id));
    showToast('Record Deleted', 'Audit record removed from history.', 'info');
  };

  // Clear all audit history
  const handleClearAllHistory = async () => {
    try {
      await deleteDummyAuditsFromDb();
      for (const item of auditHistory) {
        await deleteAuditLogFromDb(item.id);
      }
    } catch {
      // silent
    }
    setAuditHistory([]);
    showToast('History Cleared', 'All records have been cleared from audit history.', 'info');
  };

  // Select Audit from History to inspect
  const handleSelectAuditFromHistory = (audit: AuditResult) => {
    setCurrentAudit(audit);
    setRawInput(audit.rawHtml || '');
    setFormTitle(audit.formTitle);
    setPurpose(audit.purpose);
    setCurrentView('audit');
    showToast('Audit Loaded', `Loaded ${audit.formTitle} records.`);
  };

  // Admin rule actions
  const handleAddRule = async (rule: Omit<ComplianceDictionaryRule, 'id'>) => {
    const created = await createDictionaryRule(rule);
    if (created) {
      setDictionaryRules(prev => [...prev, created]);
    } else {
      const localRule: ComplianceDictionaryRule = {
        ...rule,
        id: `rule_${Date.now()}`,
      };
      setDictionaryRules(prev => [...prev, localRule]);
    }
  };

  const handleDeleteRule = async (id: string) => {
    await deleteDictionaryRule(id);
    setDictionaryRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={() => {
          setUser(null);
          try {
            localStorage.removeItem('dpdp_auditor_user');
          } catch {
            // non-fatal
          }
          showToast('Signed Out', 'Your session has been terminated.', 'info');
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'inspector' && (
          <XRayInspector
            rawInput={rawInput}
            setRawInput={setRawInput}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            purpose={purpose}
            setPurpose={setPurpose}
            onRunAudit={handleRunAudit}
            currentAudit={currentAudit}
            onNavigateToAudit={() => setCurrentView('audit')}
            onNavigateToConsent={() => setCurrentView('consent')}
            isAnalyzing={isAnalyzing}
          />
        )}

        {currentView === 'audit' && (
          <AuditDashboard
            audit={currentAudit}
            onSaveAudit={handleSaveAudit}
            isSaving={isSaving}
            onNavigateToConsent={() => setCurrentView('consent')}
            onNavigateToInspector={() => setCurrentView('inspector')}
            showToast={showToast}
          />
        )}

        {currentView === 'consent' && (
          <ConsentNoticeView
            audit={currentAudit}
            onNavigateToInspector={() => setCurrentView('inspector')}
            showToast={showToast}
          />
        )}

        {currentView === 'history' && (
          <AuditHistoryView
            history={auditHistory}
            onSelectAudit={handleSelectAuditFromHistory}
            onDeleteAudit={handleDeleteAudit}
            onClearAll={handleClearAllHistory}
            onNavigateToInspector={() => setCurrentView('inspector')}
          />
        )}

        {currentView === 'admin' && isAdminLoggedIn && (
          <AdminDashboard
            rules={dictionaryRules}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onLockAdmin={() => {
              setIsAdminLoggedIn(false);
              setCurrentView('inspector');
              showToast('Admin Locked', 'Administrative session closed.', 'info');
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer with Secret Lock Trigger */}
      <Footer
        onOpenAdminModal={() => {
          if (isAdminLoggedIn) {
            setCurrentView('admin');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Secret Admin Auth Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setCurrentView('admin');
        }}
        showToast={showToast}
      />

      {/* User Auth Modal */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={profile => {
          setUser(profile);
          try {
            localStorage.setItem('dpdp_auditor_user', JSON.stringify(profile));
          } catch {
            // non-fatal
          }
        }}
        showToast={showToast}
      />
    </div>
  );
}
