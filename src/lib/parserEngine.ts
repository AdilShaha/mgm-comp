import {
  AuditResult,
  FieldAudit,
  FormPurpose,
  DataCategory,
  SensitivityLevel,
  FieldNecessity,
  ComplianceDictionaryRule,
} from '../types/index.ts';

interface ExtractedRawField {
  name: string;
  label: string;
  tag: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio';
  inputType?: string;
  placeholder?: string;
  isRequired: boolean;
}

const PURPOSE_METADATA: Record<
  FormPurpose,
  { label: string; description: string; expectedCategories: DataCategory[] }
> = {
  newsletter: {
    label: 'Newsletter & Digital Updates',
    description: 'Digital communications, newsletters, and promotional announcements.',
    expectedCategories: ['contact', 'identity'],
  },
  ecommerce: {
    label: 'E-Commerce Order & Delivery',
    description: 'Physical order fulfillment, shipping logistics, and transaction receipts.',
    expectedCategories: ['contact', 'identity', 'location', 'financial'],
  },
  job_application: {
    label: 'Employment & Career Application',
    description: 'Candidate recruitment, qualification verification, and hiring review.',
    expectedCategories: ['identity', 'contact', 'general'],
  },
  contact_inquiry: {
    label: 'General Inquiry & Support Request',
    description: 'Customer inquiry, assistance request, or business proposal follow-up.',
    expectedCategories: ['identity', 'contact', 'general'],
  },
  fintech_loan: {
    label: 'Financial Product & KYC Verification',
    description: 'Statutory credit assessment, banking KYC, and statutory identity verification.',
    expectedCategories: ['identity', 'contact', 'financial'],
  },
  event_rsvp: {
    label: 'Community Event & Webinar RSVP',
    description: 'Attendance confirmation, badge creation, and event communications.',
    expectedCategories: ['identity', 'contact'],
  },
  account_signup: {
    label: 'User Account Registration',
    description: 'User authentication, profile setup, and self-service account management.',
    expectedCategories: ['identity', 'contact'],
  },
  custom: {
    label: 'Custom Specified Purpose',
    description: 'Custom defined processing purpose under Section 6 of the DPDP Act 2023.',
    expectedCategories: ['identity', 'contact'],
  },
};

/**
 * Robust extraction of form fields from HTML string or raw plain-text field lists
 */
export function extractFieldsFromInput(rawInput: string): ExtractedRawField[] {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // Check if it's HTML
  if (trimmed.includes('<') && (trimmed.includes('<input') || trimmed.includes('<form') || trimmed.includes('<select') || trimmed.includes('<textarea'))) {
    return extractFieldsFromHtml(trimmed);
  }

  // Otherwise, parse as plain text (lines, commas)
  return extractFieldsFromPlainText(trimmed);
}

function extractFieldsFromHtml(html: string): ExtractedRawField[] {
  const fields: ExtractedRawField[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Query all form controls
  const controls = doc.querySelectorAll('input, select, textarea');

  controls.forEach((el, index) => {
    const tagName = el.tagName.toLowerCase() as 'input' | 'select' | 'textarea';
    const inputType = el.getAttribute('type')?.toLowerCase() || (tagName === 'textarea' ? 'textarea' : 'text');

    // Skip submit, reset, button, or hidden controls that are csrf/tokens
    if (['submit', 'reset', 'button', 'image'].includes(inputType)) return;

    const name = el.getAttribute('name') || el.getAttribute('id') || `field_${index + 1}`;
    const placeholder = el.getAttribute('placeholder') || '';
    const isRequired = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';

    // Skip standard internal csrf tokens
    if (name.toLowerCase().includes('csrf') || name.toLowerCase().includes('token')) return;

    // Attempt to locate label
    let label = '';
    const id = el.getAttribute('id');
    if (id) {
      const labelEl = doc.querySelector(`label[for="${id}"]`);
      if (labelEl) {
        label = labelEl.textContent?.trim() || '';
      }
    }

    if (!label) {
      // Check parent label
      const parentLabel = el.closest('label');
      if (parentLabel) {
        const clone = parentLabel.cloneNode(true) as HTMLElement;
        const childControls = clone.querySelectorAll('input, select, textarea');
        childControls.forEach(c => c.remove());
        label = clone.textContent?.trim() || '';
      }
    }

    if (!label) {
      label = el.getAttribute('aria-label') || placeholder || formatLabelFromKey(name);
    }

    let finalTag: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' = 'input';
    if (tagName === 'select') finalTag = 'select';
    else if (tagName === 'textarea') finalTag = 'textarea';
    else if (inputType === 'checkbox') finalTag = 'checkbox';
    else if (inputType === 'radio') finalTag = 'radio';

    fields.push({
      name,
      label,
      tag: finalTag,
      inputType,
      placeholder,
      isRequired,
    });
  });

  return fields;
}

function extractFieldsFromPlainText(text: string): ExtractedRawField[] {
  // Support comma-separated or newline-separated tokens
  const tokens = text
    .split(/[\n,;]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return tokens.map((token, index) => {
    const isRequired = token.includes('*') || token.toLowerCase().includes('required');
    const cleanToken = token.replace(/[*()]/g, '').trim();
    return {
      name: cleanToken.toLowerCase().replace(/[\s-]+/g, '_'),
      label: formatLabelFromKey(cleanToken),
      tag: 'input',
      inputType: 'text',
      placeholder: `Enter ${cleanToken}`,
      isRequired,
    };
  });
}

function formatLabelFromKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Fuzzy classify field based on keywords and custom dictionary
 */
function classifyField(
  raw: ExtractedRawField,
  dictionaryRules: ComplianceDictionaryRule[]
): {
  category: DataCategory;
  sensitivity: SensitivityLevel;
  matchedRule?: ComplianceDictionaryRule;
} {
  const searchStr = `${raw.name} ${raw.label} ${raw.placeholder || ''} ${raw.inputType || ''}`.toLowerCase();

  // 1. Check custom database rules first
  for (const rule of dictionaryRules) {
    const kw = rule.keyword.toLowerCase();
    if (searchStr.includes(kw) || kw.includes(raw.name.toLowerCase())) {
      return {
        category: rule.category,
        sensitivity: rule.sensitivity,
        matchedRule: rule,
      };
    }
  }

  // 2. High-precision fuzzy heuristic regexes
  // Children / Minor Data
  if (/(child|minor|kid|under_18|guardian|parental_consent|school_grade|student_age)/.test(searchStr)) {
    return { category: 'children', sensitivity: 'critical' };
  }

  // Health / Biometric Data
  if (/(blood_group|medical|health|diagnosis|disease|disability|prescription|biometric|fingerprint|retina|iris|facial_recognition|dna|genetic)/.test(searchStr)) {
    return { category: 'health', sensitivity: 'critical' };
  }

  // Official Identity Numbers
  if (/(aadhar|aadhaar|uidai|pan_card|pan_num|voter_id|epic_no|passport|ssn|social_security|tax_id|driving_licen[sc]e|dl_num|gov_id)/.test(searchStr)) {
    return { category: 'identity', sensitivity: 'critical' };
  }

  // Financial / Transaction Data
  if (/(salary|income|net_worth|bank_acc|acc_no|account_number|ifsc|credit_card|debit_card|card_num|cvv|expiry|cibil|credit_score|upi_id)/.test(searchStr)) {
    return { category: 'financial', sensitivity: 'high' };
  }

  // Precise Geolocation
  if (/(gps|latitude|longitude|lat_lng|geolocation|live_location|precise_location|coordinates)/.test(searchStr)) {
    return { category: 'location', sensitivity: 'high' };
  }

  // Contact Details
  if (/(email|e_mail|mail_address)/.test(searchStr)) {
    return { category: 'contact', sensitivity: 'low' };
  }
  if (/(phone|mobile|mob_no|tel|cell|contact_num|contact_no|telephone|whatsapp)/.test(searchStr)) {
    return { category: 'contact', sensitivity: 'moderate' };
  }

  // General Identity
  if (/(name|fname|lname|full_name|first_name|last_name|surname|alias)/.test(searchStr)) {
    return { category: 'identity', sensitivity: 'low' };
  }
  if (/(dob|birth_date|date_of_birth|birthdate|age)/.test(searchStr)) {
    return { category: 'identity', sensitivity: 'moderate' };
  }
  if (/(gender|sex|marital_status|caste|religion|nationality)/.test(searchStr)) {
    const isSensitive = /(caste|religion)/.test(searchStr);
    return { category: 'identity', sensitivity: isSensitive ? 'critical' : 'moderate' };
  }

  // Address / General Location
  if (/(address|street|city|state|pincode|postal|zip|district|country)/.test(searchStr)) {
    return { category: 'location', sensitivity: 'moderate' };
  }

  // Default to general profile or technical
  return { category: 'general', sensitivity: 'low' };
}

/**
 * Determine necessity & compliance under DPDP Act 2023 Principles
 */
function evaluateNecessity(
  raw: ExtractedRawField,
  category: DataCategory,
  sensitivity: SensitivityLevel,
  purpose: FormPurpose,
  searchStr: string
): {
  necessity: FieldNecessity;
  reason: string;
  legalBasis: string;
  recommendation: string;
} {
  const isNewsletter = purpose === 'newsletter';
  const isContact = purpose === 'contact_inquiry';
  const isEcom = purpose === 'ecommerce';
  const isJob = purpose === 'job_application';
  const isFintech = purpose === 'fintech_loan';
  const isEvent = purpose === 'event_rsvp';

  // DPDP Section 9: Children's Data Violation
  if (category === 'children') {
    return {
      necessity: 'excess',
      reason: 'Collection of minor data requires verifiable parental consent and strict safeguards. General forms cannot collect child data.',
      legalBasis: 'DPDP Act 2023, Section 9 (Processing of Personal Data of Children)',
      recommendation: 'Remove minor fields unless operating an approved child platform with verifiable guardian consent mechanism.',
    };
  }

  // Special Category: Health & Biometric Data
  if (category === 'health') {
    if (!isJob && !isFintech) {
      return {
        necessity: 'excess',
        reason: 'Health, medical, or biometric data is disproportionate and violates the data minimization mandate for this purpose.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Purpose Limitation & Data Minimization)',
        recommendation: 'Eliminate health/biometric inputs. These pose severe regulatory liability without statutory justification.',
      };
    }
  }

  // Special Category: Government Identifiers (Aadhaar / PAN)
  if (/(aadhar|aadhaar|pan|voter_id|passport)/.test(searchStr)) {
    if (isFintech) {
      return {
        necessity: 'essential',
        reason: 'Statutory KYC identification required by banking/financial regulations under permissible processing.',
        legalBasis: 'DPDP Act 2023, Section 7 (Certain Legitimate Uses / Statutory Mandates)',
        recommendation: 'Ensure encryption in transit and rest. Retain only for statutory KYC duration.',
      };
    } else {
      return {
        necessity: 'excess',
        reason: 'Collecting official government identification for non-KYC workflows constitutes severe data over-collection.',
        legalBasis: 'DPDP Act 2023, Section 6(1) & Aadhaar Regulations (Disproportionate Collection)',
        recommendation: 'Remove government ID fields immediately. Use email or phone verification instead.',
      };
    }
  }

  // Financial details (Salary, Bank, Credit Card)
  if (category === 'financial') {
    if (isFintech) {
      return {
        necessity: 'essential',
        reason: 'Underwriting and solvency review require legitimate financial history for loan processing.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Specified Purpose Alignment)',
        recommendation: 'Mask account details and integrate via certified RBI account aggregators where feasible.',
      };
    } else if (isEcom && /(card|cvv|bank)/.test(searchStr)) {
      return {
        necessity: 'questionable',
        reason: 'Direct form inputs for card credentials violate PCI-DSS and DPDP security norms. Use compliant payment gateways.',
        legalBasis: 'DPDP Act 2023, Section 8(5) (Reasonable Security Safeguards)',
        recommendation: 'Do not collect card numbers in raw form inputs. Delegate payment capture to a certified payment gateway.',
      };
    } else {
      return {
        necessity: 'excess',
        reason: 'Financial data is non-essential for this workflow and violates purpose limitation.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Data Minimization)',
        recommendation: 'Remove financial inquiry fields from this non-transactional form.',
      };
    }
  }

  // Location / GPS details
  if (category === 'location') {
    if (/(gps|coordinates|live_location|latitude)/.test(searchStr)) {
      return {
        necessity: 'excess',
        reason: 'Continuous or fine-grained GPS geodata is excessive for standard web forms without delivery justification.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Data Minimization)',
        recommendation: 'Replace real-time GPS coordinate capture with coarse postal code or city dropdown.',
      };
    }
    if (isEcom) {
      return {
        necessity: 'essential',
        reason: 'Physical delivery address is strictly necessary to fulfill delivery of purchased merchandise.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Direct Contractual Necessity)',
        recommendation: 'Collect address only at checkout, not during early registration or browsing.',
      };
    }
    if (isNewsletter || isContact || isEvent) {
      return {
        necessity: 'excess',
        reason: 'Physical postal address is unnecessary for purely digital communications or inquiry triage.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Purpose Limitation)',
        recommendation: 'Remove physical address fields to streamline conversion and stay compliant.',
      };
    }
  }

  // Contact details
  if (category === 'contact') {
    if (/(email)/.test(searchStr)) {
      return {
        necessity: 'essential',
        reason: 'Direct communication identifier required to deliver service updates, receipts, or notices.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Specified Processing Purpose)',
        recommendation: 'Retain email and include clear one-click consent withdrawal mechanism in all mailings.',
      };
    }
    if (/(phone|mobile|tel)/.test(searchStr)) {
      if (isNewsletter) {
        return {
          necessity: 'excess',
          reason: 'Phone numbers are disproportionate for email newsletters. Unsolicited SMS/calls violate consent bounds.',
          legalBasis: 'DPDP Act 2023, Section 6(1) (Purpose Limitation)',
          recommendation: 'Remove phone number from newsletter signups or make it strictly optional with separate consent.',
        };
      }
      return {
        necessity: isEcom || isJob || isFintech ? 'essential' : 'questionable',
        reason: 'Phone contact is acceptable for critical delivery or 2FA, but should be optional for casual inquiries.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Proportionality Check)',
        recommendation: isEcom || isJob ? 'Keep field for delivery status or interview coordination.' : 'Make phone number optional.',
      };
    }
  }

  // Identity / Names
  if (category === 'identity') {
    if (/(name|fname|lname)/.test(searchStr)) {
      return {
        necessity: 'essential',
        reason: 'Basic personal identification required to personalize communications and address the Data Principal.',
        legalBasis: 'DPDP Act 2023, Section 5(1) & 6(1) (Notice and Specified Purpose)',
        recommendation: 'Retain name field.',
      };
    }
    if (/(caste|religion|marital_status)/.test(searchStr)) {
      return {
        necessity: 'excess',
        reason: 'Socio-cultural, religious, or matrimonial classifications carry high sensitivity and discriminatory risk.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Data Minimization & Fairness)',
        recommendation: 'Strictly delete questions on religion, caste, or marital status.',
      };
    }
    if (/(dob|age|birth)/.test(searchStr)) {
      if (isFintech || isJob) {
        return {
          necessity: 'essential',
          reason: 'Legal age verification required to enter legally binding contracts and employment agreements.',
          legalBasis: 'DPDP Act 2023, Section 6(1) & Indian Contract Act 1872',
          recommendation: 'Collect only date of birth, without requesting unnecessary birth certificates unless verified.',
        };
      }
      return {
        necessity: isNewsletter ? 'excess' : 'questionable',
        reason: 'Exact date of birth is excessive for general subscriptions. Consider asking for an age range or 18+ checkbox.',
        legalBasis: 'DPDP Act 2023, Section 6(1) (Minimization Principle)',
        recommendation: 'Replace exact date of birth with a simple confirmation checkbox confirming user is of legal age.',
      };
    }
  }

  // General fallback
  return {
    necessity: 'questionable',
    reason: 'Field requires affirmative review to substantiate purpose alignment under DPDP Section 6.',
    legalBasis: 'DPDP Act 2023, Section 6(1) (Specified Purpose Requirement)',
    recommendation: 'Document specific business rationale in internal compliance registry or make field optional.',
  };
}

/**
 * Execute full DPDP compliance audit on provided form input
 */
export function runDpdPAudit(
  rawInput: string,
  purpose: FormPurpose,
  formTitle: string = 'Web Form Audit',
  customRules: ComplianceDictionaryRule[] = []
): AuditResult {
  const extracted = extractFieldsFromInput(rawInput);
  const purposeMeta = PURPOSE_METADATA[purpose] || PURPOSE_METADATA.custom;

  const auditedFields: FieldAudit[] = extracted.map((raw, idx) => {
    const { category, sensitivity } = classifyField(raw, customRules);
    const searchStr = `${raw.name} ${raw.label} ${raw.placeholder || ''}`.toLowerCase();
    const evaluation = evaluateNecessity(raw, category, sensitivity, purpose, searchStr);

    return {
      id: `field_${idx + 1}_${raw.name}`,
      name: raw.name,
      label: raw.label,
      tag: raw.tag,
      inputType: raw.inputType,
      placeholder: raw.placeholder,
      isRequired: raw.isRequired,
      category,
      sensitivity,
      necessity: evaluation.necessity,
      reason: evaluation.reason,
      legalBasis: evaluation.legalBasis,
      recommendation: evaluation.recommendation,
    };
  });

  // Calculate compliance statistics
  const totalFields = auditedFields.length;
  const essentialCount = auditedFields.filter(f => f.necessity === 'essential').length;
  const questionableCount = auditedFields.filter(f => f.necessity === 'questionable').length;
  const excessCount = auditedFields.filter(f => f.necessity === 'excess').length;

  const childrenDataPresent = auditedFields.some(f => f.category === 'children');
  const biometricDataPresent = auditedFields.some(f => f.category === 'health' && f.sensitivity === 'critical');
  const financialDataPresent = auditedFields.some(f => f.category === 'financial');

  // Compute 0-100 Compliance Score
  let score = 100;

  if (totalFields > 0) {
    auditedFields.forEach(f => {
      if (f.necessity === 'excess') {
        if (f.sensitivity === 'critical') {
          score -= 30; // Biometric, health, minor data, caste
        } else if (f.sensitivity === 'high') {
          score -= 20; // Official IDs, financial in non-fintech
        } else {
          score -= 15; // General excess fields
        }
      } else if (f.necessity === 'questionable') {
        score -= 6;
      }

      // Excess penalty if unnecessary field is marked required
      if (f.necessity !== 'essential' && f.isRequired) {
        score -= 5;
      }
    });

    if (childrenDataPresent) {
      score -= 25; // Severe penalty for unmitigated child data collection
    }
  } else {
    score = 100;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status: 'compliant' | 'warning' | 'high_risk' = 'compliant';
  if (score < 60 || excessCount >= 2 || childrenDataPresent) {
    status = 'high_risk';
  } else if (score < 85 || excessCount > 0 || questionableCount > 1) {
    status = 'warning';
  }

  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    formTitle: formTitle.trim() || 'Audited Web Form',
    purpose,
    purposeLabel: purposeMeta.label,
    purposeDescription: purposeMeta.description,
    totalFields,
    complianceScore: score,
    status,
    fields: auditedFields,
    essentialCount,
    questionableCount,
    excessCount,
    childrenDataPresent,
    biometricDataPresent,
    financialDataPresent,
    rawHtml: rawInput,
    createdAt: new Date().toISOString(),
  };
}
