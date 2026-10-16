import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  Search,
  BookOpen,
  Filter,
  Sliders,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ComplianceDictionaryRule, DataCategory, SensitivityLevel } from '../types/index.ts';

interface AdminDashboardProps {
  rules: ComplianceDictionaryRule[];
  onAddRule: (rule: Omit<ComplianceDictionaryRule, 'id'>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onLockAdmin: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  rules,
  onAddRule,
  onDeleteRule,
  onLockAdmin,
  showToast,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New Rule Form State
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState<DataCategory>('identity');
  const [newSensitivity, setNewSensitivity] = useState<SensitivityLevel>('moderate');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRules = rules.filter(rule => {
    const matchesSearch =
      rule.keyword.toLowerCase().includes(search.toLowerCase()) ||
      rule.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddRule({
        keyword: newKeyword.trim().toLowerCase(),
        category: newCategory,
        sensitivity: newSensitivity,
        description: newDescription.trim() || `Pattern matching for ${newKeyword}`,
        is_system: false,
      });
      showToast('Rule Added', `Keyword "${newKeyword}" registered in compliance dictionary.`, 'success');
      setNewKeyword('');
      setNewDescription('');
      setIsAdding(false);
    } catch {
      showToast('Error', 'Failed to save rule.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, keyword: string) => {
    try {
      await onDeleteRule(id);
      showToast('Rule Removed', `Keyword "${keyword}" deleted from engine dictionary.`, 'info');
    } catch {
      showToast('Error', 'Failed to delete rule.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Compliance Rule Engine Administration
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              Admin Verified
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Configure global fuzzy matching keywords, classification categories, and DPDP sensitivity thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Keyword Rule</span>
          </button>

          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Add Rule Form Modal / Drawer */}
      {isAdding && (
        <form
          onSubmit={handleCreateRule}
          className="p-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Register New Keyword Rule
            </h3>
            <span className="text-[11px] text-zinc-500">
              Updates active runtime classification engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Keyword / Pattern *
              </label>
              <input
                type="text"
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                placeholder="e.g. pan_card, voter_id, salary"
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Data Category
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as DataCategory)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 capitalize"
              >
                <option value="identity">Identity</option>
                <option value="contact">Contact</option>
                <option value="financial">Financial</option>
                <option value="health">Health & Biometric</option>
                <option value="location">Location & Geodata</option>
                <option value="children">Children & Minors</option>
                <option value="technical">Technical</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Sensitivity Level
              </label>
              <select
                value={newSensitivity}
                onChange={e => setNewSensitivity(e.target.value as SensitivityLevel)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 capitalize"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Statutory Rationale Description
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="e.g. Official government tax identifier"
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="py-1.5 px-3 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newKeyword.trim()}
              className="py-1.5 px-4 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Register Rule'}
            </button>
          </div>
        </form>
      )}

      {/* Rules Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Active Keyword Dictionaries
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              ({filteredRules.length} rules)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search keywords..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 capitalize font-medium"
            >
              <option value="all">All Categories</option>
              <option value="identity">Identity</option>
              <option value="contact">Contact</option>
              <option value="financial">Financial</option>
              <option value="health">Health</option>
              <option value="location">Location</option>
              <option value="children">Children</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-500 font-medium">
                <th className="py-3 px-4">Pattern / Keyword</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Sensitivity</th>
                <th className="py-3 px-4">Statutory Description</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-sans">
              {filteredRules.map(rule => (
                <tr
                  key={rule.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {rule.keyword}
                  </td>
                  <td className="py-3 px-4 font-mono uppercase text-zinc-600 dark:text-zinc-400">
                    {rule.category}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded ${
                        rule.sensitivity === 'critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : rule.sensitivity === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {rule.sensitivity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {rule.description}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(rule.id, rule.keyword)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Delete rule"
                      aria-label="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
