# DPDP Form Auditor 🛡️
> Intelligent Form Compliance Engine, Data Classifier, and Multilingual Consent Notice Generator for the India DPDP Act 2023.

Project Link : https://formauditor.ai.studio
---

## 📌 Problem Statement
The **Digital Personal Data Protection Act (DPDP Act, 2023)** mandates strict **Purpose Limitation (Section 6)**, **Data Minimization**, and **Parental Consent Verification for Children (Section 9)**, with non-compliance penalties reaching up to ₹250 Crores. 

Most web forms today collect disproportionate personal data (e.g., asking for phone numbers, national IDs, or health metrics for digital newsletters). Engineering and legal teams lack automated tools to scan form inputs, measure compliance risk, and produce legally enforceable consent notices.

---

## 🚀 Core Features

### 1. Live X-Ray Inspector ("Wow" Feature)
- **Split-Screen Interaction**: Paste raw `<form>` HTML, enter comma-separated field lists (e.g., `Name, Email, Phone, Aadhaar, Salary`), or enter a target URL.
- **Visual Skeleton Glow**: Dynamically renders the form layout. Fields pulse in **Rose** for statutory excess collection violations and glow in **Emerald** for verified essential data.
- **Statutory Deep-Dive**: Click any field to inspect its specific legal basis (e.g., DPDP Section 6(1) Data Minimization, Section 9 Protection of Minors).

### 2. Instant URL Scanner
- **Live Web Scan**: Input any web form URL to trigger a 3-second DOM inspection animation that extracts form inputs and maps compliance vulnerabilities.
- **Quick Presets**: One-click test fixtures for Over-collecting Newsletters, E-Commerce Checkout, and Financial KYC applications.

### 3. DPDP Compliance Scoring & Audit Dashboard
- **0–100 Compliance Gauge**: Visual circular SVG scoring meter evaluating proportionality, sensitivity, and necessity.
- **Categorization Engine**: Classifies data into Identity, Contact, Financial, Health & Biometric, Location, and Children Data.
- **Report Export**: Download structured audit reports as formatted documents or copy executive summaries.

### 4. Multilingual Section 5 Consent Generator
- **Tri-Lingual Notices**: Generates enforceable statutory notices in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** in accordance with Section 5(3) of the Act.
- **Mandatory Disclosures**: Automatically drafts itemized data collection schedules, withdrawal mechanisms (Section 6(4)), and Grievance Redressal Officer contact cards.
- **Embeddable Web Snippets**: Ready-to-use HTML code blocks to drop directly onto website frontends.

### 5. Historical Audit Logs & User Accounts
- Save audit reports, monitor compliance scores over time, and manage records through Supabase Auth.
- Features a streamlined local session fallback to allow uninterrupted auditing.

### 6. Secret Admin Console (Ninja Gateway)
- Completely hidden from standard navigation.
- Accessible exclusively via an unobtrusive lock icon in the footer (`admin` / `admin123`) to manage global keyword classification rules and statutory mappings.

---

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS (Strict Anti-Slop Palette: Zinc neutrals, Emerald compliance, Rose violations, Amber warnings)
- **Icons**: Lucide-React
- **Database & Authentication**: Supabase JS (`@supabase/supabase-js`)
- **Typography**: Plus Jakarta Sans (Prose & Headers), JetBrains Mono (Tabular Data & Telemetry)

---

## 🗄️ Database Connection Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL Editor**, run the schema script to provision `profiles`, `compliance_dictionaries`, and `audit_logs` tables along with Row Level Security (RLS) policies.
3. Configure your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
