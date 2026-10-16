import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ComplianceDictionaryRule, AuditResult } from '../types/index.ts';

function sanitizeEnv(val: string | undefined): string {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip trailing semicolons, commas, or whitespace
  cleaned = cleaned.replace(/[;,]+$/, '').trim();
  // Strip surrounding single/double quotes if present
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  return cleaned;
}

const supabaseUrl = sanitizeEnv(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Fetch global dictionary rules from Supabase
 */
export async function fetchDictionaryRules(): Promise<ComplianceDictionaryRule[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('compliance_dictionaries')
      .select('*')
      .order('keyword', { ascending: true });

    if (error) {
      return [];
    }
    return (data as ComplianceDictionaryRule[]) || [];
  } catch {
    return [];
  }
}

/**
 * Save new dictionary rule (Admin only)
 */
export async function createDictionaryRule(
  rule: Omit<ComplianceDictionaryRule, 'id'>
): Promise<ComplianceDictionaryRule | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('compliance_dictionaries')
      .insert([rule])
      .select()
      .single();

    if (error) throw error;
    return data as ComplianceDictionaryRule;
  } catch (err) {
    console.error('Failed to create rule', err);
    throw err;
  }
}

/**
 * Delete dictionary rule (Admin only)
 */
export async function deleteDictionaryRule(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('compliance_dictionaries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete rule', err);
    throw err;
  }
}

/**
 * Update dictionary rule (Admin only)
 */
export async function updateDictionaryRule(
  id: string,
  updates: Partial<ComplianceDictionaryRule>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('compliance_dictionaries')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to update rule', err);
    throw err;
  }
}

/**
 * Save audit log to Supabase
 */
export async function saveAuditLogToDb(
  audit: AuditResult,
  userId?: string | null
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: audit.id,
      user_id: userId || null,
      form_title: audit.formTitle,
      purpose: audit.purpose,
      purpose_label: audit.purposeLabel,
      total_fields: audit.totalFields,
      compliance_score: audit.complianceScore,
      status: audit.status,
      essential_count: audit.essentialCount,
      questionable_count: audit.questionableCount,
      excess_count: audit.excessCount,
      children_data_present: audit.childrenDataPresent,
      biometric_data_present: audit.biometricDataPresent,
      financial_data_present: audit.financialDataPresent,
      fields: audit.fields,
      raw_html: audit.rawHtml || '',
      created_at: audit.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('audit_logs').insert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to save audit log', err);
    throw err;
  }
}

/**
 * Fetch saved audit logs from Supabase (excluding dummy data)
 */
export async function fetchAuditLogsFromDb(userId?: string | null): Promise<AuditResult[]> {
  if (!supabase) return [];
  try {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) return [];

    // Filter out any dummy seed records
    const userRecords = (data || []).filter((row: any) => !row.id?.startsWith('audit_demo_'));

    return userRecords.map((row: any) => ({
      id: row.id,
      formTitle: row.form_title || 'Untitled Form',
      purpose: row.purpose,
      purposeLabel: row.purpose_label || row.purpose,
      purposeDescription: row.purpose_description || '',
      totalFields: row.total_fields || 0,
      complianceScore: row.compliance_score || 0,
      status: row.status || 'warning',
      fields: row.fields || [],
      essentialCount: row.essential_count || 0,
      questionableCount: row.questionable_count || 0,
      excessCount: row.excess_count || 0,
      childrenDataPresent: row.children_data_present || false,
      biometricDataPresent: row.biometric_data_present || false,
      financialDataPresent: row.financial_data_present || false,
      rawHtml: row.raw_html || '',
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Delete any dummy/demo audits from the database
 */
export async function deleteDummyAuditsFromDb(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('audit_logs').delete().like('id', 'audit_demo_%');
  } catch {
    // non-fatal
  }
}

/**
 * Delete an audit log
 */
export async function deleteAuditLogFromDb(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('audit_logs').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete audit log', err);
    throw err;
  }
}
