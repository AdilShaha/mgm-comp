import { FormPurpose } from '../types/index.ts';

export interface FormTemplate {
  id: string;
  title: string;
  purpose: FormPurpose;
  badge: string;
  description: string;
  html: string;
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'overcollecting_newsletter',
    title: 'Newsletter Subscription (Excessive Collection)',
    purpose: 'newsletter',
    badge: 'High Non-Compliance Risk',
    description: 'A marketing subscription form improperly demanding Aadhaar, live GPS coordinates, salary, and medical history.',
    html: `<form action="/subscribe" method="POST">
  <h2>Weekly Tech & Commerce Newsletter</h2>
  
  <label for="full_name">Full Name *</label>
  <input type="text" id="full_name" name="full_name" placeholder="Aditi Sharma" required />

  <label for="email">Email Address *</label>
  <input type="email" id="email" name="email" placeholder="aditi@example.com" required />

  <label for="mob_no">Mobile Phone Number *</label>
  <input type="tel" id="mob_no" name="mob_no" placeholder="+91 98765 43210" required />

  <label for="aadhar_no">Aadhaar Card Number *</label>
  <input type="text" id="aadhar_no" name="aadhar_no" placeholder="12-digit UIDAI number" required />

  <label for="annual_salary">Annual Household Income</label>
  <input type="number" id="annual_salary" name="annual_salary" placeholder="₹ per annum" />

  <label for="blood_group">Blood Group</label>
  <input type="text" id="blood_group" name="blood_group" placeholder="e.g. O positive" />

  <label for="live_gps_coords">Precise GPS Coordinates</label>
  <input type="text" id="live_gps_coords" name="live_gps_coords" placeholder="Lat / Long coordinates" />

  <label for="child_age">Children Under 18 in Household</label>
  <input type="number" id="child_age" name="child_age" placeholder="Number of minors" />

  <button type="submit">Subscribe Now</button>
</form>`,
  },
  {
    id: 'compliant_minimal',
    title: 'Minimal Compliant Newsletter',
    purpose: 'newsletter',
    badge: 'Exemplary Compliance',
    description: 'A strictly minimized subscription form adhering to Section 6(1) Purpose Limitation.',
    html: `<form action="/newsletter-signup" method="POST">
  <h2>Subscribe to Weekly Insights</h2>
  <p>Stay informed with our weekly policy and legal updates.</p>

  <label for="subscriber_name">First Name</label>
  <input type="text" id="subscriber_name" name="subscriber_name" placeholder="Your name (optional)" />

  <label for="subscriber_email">Email Address *</label>
  <input type="email" id="subscriber_email" name="subscriber_email" placeholder="name@company.com" required />

  <button type="submit">Join Newsletter</button>
</form>`,
  },
  {
    id: 'job_application_invasive',
    title: 'Candidate Application (With Invasive Queries)',
    purpose: 'job_application',
    badge: 'Moderate Risk',
    description: 'Job portal form asking for valid credentials along with unlawful questions on caste and religion.',
    html: `<form action="/careers/apply" method="POST">
  <h2>Senior Systems Engineer Application</h2>

  <label for="candidate_name">Full Name *</label>
  <input type="text" id="candidate_name" name="candidate_name" placeholder="Legal full name" required />

  <label for="contact_email">Email *</label>
  <input type="email" id="contact_email" name="contact_email" placeholder="you@domain.com" required />

  <label for="contact_phone">Phone Number *</label>
  <input type="tel" id="contact_phone" name="contact_phone" placeholder="+91 99999 99999" required />

  <label for="caste_category">Caste Category / Reservation Status</label>
  <input type="text" id="caste_category" name="caste_category" placeholder="Optional category" />

  <label for="marital_status">Marital Status</label>
  <select id="marital_status" name="marital_status">
    <option value="single">Single</option>
    <option value="married">Married</option>
  </select>

  <label for="portfolio_url">Portfolio / GitHub Profile</label>
  <input type="url" id="portfolio_url" name="portfolio_url" placeholder="https://..." />

  <label for="expected_salary">Expected CTC (INR)</label>
  <input type="number" id="expected_salary" name="expected_salary" placeholder="Gross expected salary" />

  <button type="submit">Submit Application</button>
</form>`,
  },
  {
    id: 'ecommerce_checkout',
    title: 'E-Commerce Shipping Checkout',
    purpose: 'ecommerce',
    badge: 'Standard E-Commerce',
    description: 'Physical order delivery form with address collection and delivery phone.',
    html: `<form action="/checkout/shipping" method="POST">
  <h2>Delivery & Shipping Address</h2>

  <label for="recipient_name">Full Name *</label>
  <input type="text" id="recipient_name" name="recipient_name" placeholder="Name for parcel delivery" required />

  <label for="delivery_email">Email Address *</label>
  <input type="email" id="delivery_email" name="delivery_email" placeholder="For dispatch updates" required />

  <label for="delivery_phone">Delivery Phone *</label>
  <input type="tel" id="delivery_phone" name="delivery_phone" placeholder="10-digit mobile number" required />

  <label for="shipping_address">Shipping Street Address *</label>
  <textarea id="shipping_address" name="shipping_address" placeholder="Flat, building, street" required></textarea>

  <label for="pincode">Postal PIN Code *</label>
  <input type="text" id="pincode" name="pincode" placeholder="6-digit PIN" required />

  <label for="patient_medical_history">Medical Conditions / Prescriptions</label>
  <input type="text" id="patient_medical_history" name="patient_medical_history" placeholder="Any allergies?" />

  <button type="submit">Proceed to Payment</button>
</form>`,
  },
  {
    id: 'fintech_kyc',
    title: 'Personal Loan & KYC Application',
    purpose: 'fintech_loan',
    badge: 'Statutory Financial KYC',
    description: 'Legitimate financial application under RBI & Section 7 legitimate use provisions.',
    html: `<form action="/fintech/apply" method="POST">
  <h2>Personal Credit Line Application</h2>

  <label for="applicant_name">Full Name (as per PAN) *</label>
  <input type="text" id="applicant_name" name="applicant_name" placeholder="First and last name" required />

  <label for="pan_number">Permanent Account Number (PAN) *</label>
  <input type="text" id="pan_number" name="pan_number" placeholder="ABCDE1234F" required />

  <label for="monthly_income">Monthly Net In-hand Salary *</label>
  <input type="number" id="monthly_income" name="monthly_income" placeholder="Monthly salary in INR" required />

  <label for="applicant_mobile">Aadhaar-linked Mobile *</label>
  <input type="tel" id="applicant_mobile" name="applicant_mobile" placeholder="Mobile number" required />

  <label for="applicant_email">Work Email *</label>
  <input type="email" id="applicant_email" name="applicant_email" placeholder="Official email" required />

  <label for="biometric_iris">Biometric Iris Scan Raw File</label>
  <input type="file" id="biometric_iris" name="biometric_iris" />

  <button type="submit">Verify & Submit KYC</button>
</form>`,
  },
];
