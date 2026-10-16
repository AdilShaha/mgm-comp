/**
 * Data structures for DPDP Form Auditor
 * Conforming to India Digital Personal Data Protection Act, 2023
 */

export type DataCategory =
  | 'identity'
  | 'contact'
  | 'financial'
  | 'health'
  | 'location'
  | 'children'
  | 'technical'
  | 'general';

export type SensitivityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type FieldNecessity = 'essential' | 'questionable' | 'excess';

export type FormPurpose =
  | 'newsletter'
  | 'ecommerce'
  | 'job_application'
  | 'contact_inquiry'
  | 'fintech_loan'
  | 'event_rsvp'
  | 'account_signup'
  | 'custom';

export interface FieldAudit {
  id: string;
  name: string;
  label: string;
  tag: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio';
  inputType?: string;
  placeholder?: string;
  isRequired: boolean;
  category: DataCategory;
  sensitivity: SensitivityLevel;
  necessity: FieldNecessity;
  reason: string;
  legalBasis: string;
  recommendation: string;
}

export interface AuditResult {
  id: string;
  formTitle: string;
  purpose: FormPurpose;
  purposeLabel: string;
  purposeDescription: string;
  totalFields: number;
  complianceScore: number;
  status: 'compliant' | 'warning' | 'high_risk';
  fields: FieldAudit[];
  essentialCount: number;
  questionableCount: number;
  excessCount: number;
  childrenDataPresent: boolean;
  biometricDataPresent: boolean;
  financialDataPresent: boolean;
  rawHtml?: string;
  createdAt: string;
}

export interface ComplianceDictionaryRule {
  id: string;
  keyword: string;
  category: DataCategory;
  sensitivity: SensitivityLevel;
  description: string;
  is_system?: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
}
