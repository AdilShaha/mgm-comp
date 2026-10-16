import { AuditResult, FieldAudit } from '../types/index.ts';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface ConsentNoticeDetails {
  organizationName: string;
  grievanceOfficerName: string;
  grievanceOfficerEmail: string;
  grievanceAddress: string;
}

export const DEFAULT_NOTICE_DETAILS: ConsentNoticeDetails = {
  organizationName: 'Enterprise Data Fiduciary Ltd.',
  grievanceOfficerName: 'R. K. Sharma',
  grievanceOfficerEmail: 'grievance-officer@fiduciary.co.in',
  grievanceAddress: 'Compliance Division, Tech Boulevard, Sector 62, Noida, Uttar Pradesh, 201309',
};

/**
 * Generate DPDP Section 5 Compliant Notice in English, Hindi, and Marathi
 */
export function generateConsentNotice(
  audit: AuditResult,
  details: ConsentNoticeDetails = DEFAULT_NOTICE_DETAILS,
  lang: SupportedLanguage = 'en'
): {
  language: SupportedLanguage;
  title: string;
  content: string;
  htmlSnippet: string;
} {
  const essentialFields = audit.fields.filter(f => f.necessity === 'essential');
  const allCollectedFields = audit.fields;

  if (lang === 'hi') {
    return generateHindiNotice(audit, essentialFields, allCollectedFields, details);
  } else if (lang === 'mr') {
    return generateMarathiNotice(audit, essentialFields, allCollectedFields, details);
  }

  return generateEnglishNotice(audit, essentialFields, allCollectedFields, details);
}

function generateEnglishNotice(
  audit: AuditResult,
  essentialFields: FieldAudit[],
  allFields: FieldAudit[],
  details: ConsentNoticeDetails
) {
  const fieldsListText = allFields
    .map((f, i) => `${i + 1}. ${f.label} (${f.category.toUpperCase()}) — ${f.reason}`)
    .join('\n');

  const content = `NOTICE OF COLLECTION AND PROCESSING OF PERSONAL DATA
[Pursuant to Section 5 of the Digital Personal Data Protection Act, 2023 (DPDP Act)]

1. DATA FIDUCIARY IDENTIFICATION
This notice is issued by ${details.organizationName} ("Data Fiduciary") to inform you ("Data Principal") regarding the processing of your personal data.

2. SPECIFIED PURPOSE OF PROCESSING
Your personal data is requested exclusively for the following lawful and specified purpose:
"${audit.purposeDescription}"
In accordance with Section 6(1) of the DPDP Act 2023, data collected shall be limited strictly to what is necessary for fulfilling this stated purpose.

3. ITEMIZED PERSONAL DATA COLLECTED
The following personal data attributes are requested through this form:
${fieldsListText || 'No specific personal data fields detected.'}

4. MANNER OF EXERCISING YOUR STATUTORY RIGHTS
As a Data Principal, you possess statutory rights under the DPDP Act, 2023:
- Right to Access & Summary (Section 11): You may request a summary of your personal data processed and identities of all Data Processors with whom data has been shared.
- Right to Correction and Erasure (Section 12): You may request the rectification of inaccurate data or complete erasure of data no longer required for the specified purpose.
- Right of Grievance Redressal (Section 13): You may register any dissatisfaction or compliance concern with our Grievance Redressal Officer.
- Right to Nominate (Section 14): You may nominate any individual to exercise your rights in the event of death or incapacity.

5. WITHDRAWAL OF CONSENT (SECTION 6(4))
You are entitled to withdraw your consent at any time with the same ease with which it was provided. You may initiate withdrawal by visiting your account privacy preferences or by transmitting an email to: ${details.grievanceOfficerEmail}. Upon receipt of withdrawal, processing shall cease within statutory timelines, subject to any prevailing statutory retention mandates.

6. GRIEVANCE REDRESSAL OFFICER & REGULATORY ESCALATION
For inquiries, objections, or exercise of your statutory rights, contact:
- Officer: ${details.grievanceOfficerName} (Data Grievance Redressal Officer)
- Email: ${details.grievanceOfficerEmail}
- Physical Address: ${details.grievanceAddress}

If your grievance is not resolved within the prescribed timeline, you retain the statutory right under Section 13(3) to lodge a formal complaint with the Data Protection Board of India (DPBI).`;

  const htmlSnippet = `<div class="dpdp-consent-notice" style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.6; color: #27272a; padding: 16px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa;">
  <p style="font-weight: 600; margin-bottom: 8px;">Notice under Digital Personal Data Protection Act, 2023</p>
  <p style="margin-bottom: 8px;"><strong>${details.organizationName}</strong> collects your ${allFields.map(f => f.label).slice(0, 4).join(', ')}${allFields.length > 4 ? ' and related details' : ''} solely for <em>${audit.purposeDescription}</em>.</p>
  <p style="margin-bottom: 8px;">You retain the right to access, correct, or withdraw consent at any time by contacting our Grievance Officer at <strong>${details.grievanceOfficerEmail}</strong>, or escalate to the Data Protection Board of India.</p>
  <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; cursor: pointer;">
    <input type="checkbox" required style="accent-color: #059669;" />
    <span>I have read this DPDP Notice and voluntarily consent to the collection of my personal data for the specified purpose.</span>
  </label>
</div>`;

  return {
    language: 'en' as SupportedLanguage,
    title: 'English DPDP Consent Notice',
    content,
    htmlSnippet,
  };
}

function generateHindiNotice(
  audit: AuditResult,
  essentialFields: FieldAudit[],
  allFields: FieldAudit[],
  details: ConsentNoticeDetails
) {
  const fieldsListText = allFields
    .map((f, i) => `${i + 1}. ${f.label} (${f.category.toUpperCase()})`)
    .join('\n');

  const content = `व्यक्तिगत डेटा संग्रह एवं प्रसंस्करण की सूचना
[डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP Act) की धारा 5 के अंतर्गत जारी]

1. डेटा फिड्यूशरी (डेटा न्यासी) की पहचान
यह सूचना ${details.organizationName} ("डेटा फिड्यूशरी") द्वारा आपको ("डेटा प्रिंसिपल" / डेटा स्वामी) आपके व्यक्तिगत डेटा के प्रसंस्करण के संबंध में सूचित करने हेतु जारी की गई है।

2. डेटा प्रसंस्करण का विशिष्ट उद्देश्य
आपके व्यक्तिगत डेटा का अनुरोध केवल निम्नलिखित वैध और स्पष्ट उद्देश्य के लिए किया जाता है:
"${audit.purposeDescription}"
DPDP अधिनियम 2023 की धारा 6(1) के अनुसार, एकत्र किया गया डेटा केवल इस घोषित उद्देश्य को पूरा करने के लिए आवश्यक सीमा तक ही सीमित रहेगा।

3. एकत्र किए जाने वाले व्यक्तिगत डेटा विवरण
इस प्रपत्र के माध्यम से निम्नलिखित व्यक्तिगत डेटा एकत्र किया जा रहा है:
${fieldsListText || 'कोई विशिष्ट व्यक्तिगत डेटा फ़ील्ड नहीं मिली।'}

4. आपके वैधानिक अधिकारों के प्रयोग की प्रक्रिया
DPDP अधिनियम, 2023 के तहत आपको निम्नलिखित अधिकार प्राप्त हैं:
- जानकारी एवं सारांश प्राप्त करने का अधिकार (धारा 11): आप अपने प्रसंस्कृत डेटा और इसे साझा किए गए डेटा प्रोसेसरों की सूची प्राप्त कर सकते हैं।
- सुधार एवं विलोपन का अधिकार (धारा 12): आप गलत डेटा को सुधारने या उद्देश्य समाप्ति के उपरांत डेटा को मिटाने का अनुरोध कर सकते हैं।
- शिकायत निवारण का अधिकार (धारा 13): आप किसी भी शिकायत हेतु हमारे शिकायत निवारण अधिकारी से संपर्क कर सकते हैं।
- नामांकन का अधिकार (धारा 14): आप अपनी मृत्यु या असमर्थता की स्थिति में अधिकारों के प्रयोग हेतु किसी व्यक्ति को नामांकित कर सकते हैं।

5. सहमति वापस लेने का अधिकार (धारा 6(4))
आप किसी भी समय अपनी सहमति उसी सरलता से वापस ले सकते हैं जिस सरलता से यह दी गई थी। सहमति वापस लेने के लिए आप ${details.grievanceOfficerEmail} पर ईमेल भेज सकते हैं।

6. शिकायत निवारण अधिकारी एवं नियामक अपील
- शिकायत अधिकारी: ${details.grievanceOfficerName}
- ईमेल: ${details.grievanceOfficerEmail}
- पता: ${details.grievanceAddress}

यदि आपकी शिकायत का समाधान निर्धारित समय सीमा में नहीं होता है, तो आपको भारत के डेटा संरक्षण बोर्ड (DPBI) के समक्ष औपचारिक शिकायत दर्ज करने का वैधानिक अधिकार प्राप्त है।`;

  const htmlSnippet = `<div class="dpdp-consent-notice" style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.6; color: #27272a; padding: 16px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa;">
  <p style="font-weight: 600; margin-bottom: 8px;">डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के अंतर्गत सूचना</p>
  <p style="margin-bottom: 8px;"><strong>${details.organizationName}</strong> आपका डेटा केवल <em>${audit.purposeDescription}</em> के लिए एकत्र कर रहा है।</p>
  <p style="margin-bottom: 8px;">आप किसी भी समय <strong>${details.grievanceOfficerEmail}</strong> पर संपर्क करके सहमति वापस ले सकते हैं।</p>
  <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; cursor: pointer;">
    <input type="checkbox" required style="accent-color: #059669;" />
    <span>मैंने यह DPDP सूचना पढ़ ली है और निर्धारित उद्देश्य के लिए अपने डेटा के प्रसंस्करण हेतु सहमति प्रदान करता/करती हूँ।</span>
  </label>
</div>`;

  return {
    language: 'hi' as SupportedLanguage,
    title: 'हिन्दी DPDP सहमति सूचना (Hindi Notice)',
    content,
    htmlSnippet,
  };
}

function generateMarathiNotice(
  audit: AuditResult,
  essentialFields: FieldAudit[],
  allFields: FieldAudit[],
  details: ConsentNoticeDetails
) {
  const fieldsListText = allFields
    .map((f, i) => `${i + 1}. ${f.label} (${f.category.toUpperCase()})`)
    .join('\n');

  const content = `वैयक्तिक डेटा संकलन व प्रक्रिया सूचना
[डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ (DPDP Act) च्या कलम ५ अन्वये जारी]

१. डेटा फिड्युशरी (डेटा विश्वस्त) ओळख
ही सूचना ${details.organizationName} ("डेटा फिड्युशरी") द्वारे तुम्हाला ("डेटा प्रिन्सिपल" / डेटा मालक) तुमच्या वैयक्तिक माहितीच्या प्रक्रियेबाबत माहिती देण्यासाठी जारी केली आहे.

२. प्रक्रियेचा विनिर्दिष्ट हेतू
आपल्या वैयक्तिक माहितीची मागणी केवळ खालील अधिकृत व स्पष्ट हेतूसाठी केली जात आहे:
"${audit.purposeDescription}"
DPDP कायदा २०२३ च्या कलम ६(१) नुसार, गोळा केला जाणारा डेटा केवळ या हेतूच्या पूर्ततेसाठी आवश्यक असलेल्या मर्यादेतच असेल.

३. संकलित वैयक्तिक डेटाची तपशीलवार सूची
या अर्जाद्वारे खालील वैयक्तिक माहिती गोळा केली जात आहे:
${fieldsListText || 'कोणतीही वैयक्तिक माहिती फील्ड आढळली नाही.'}

४. वैधानिक अधिकारांचा वापर
DPDP कायदा, २०२३ अंतर्गत तुम्हाला खालील कायदेशीर अधिकार आहेत:
- माहिती व सारांश मिळवण्याचा अधिकार (कलम ११): प्रक्रिया केलेल्या वैयक्तिक डेटाची माहिती घेण्याचा अधिकार.
- दुरुस्ती व डेटा नष्ट करण्याचा अधिकार (कलम १२): चुकीचा डेटा दुरुस्त करणे किंवा हेतू संपल्यानंतर डेटा नष्ट करण्याची विनंती करण्याचा अधिकार.
- तक्रार निवारणाचा अधिकार (कलम १३): तक्रार निवारण अधिकाऱ्याकडे दाद मागण्याचा अधिकार.
- वारसदार नामनिर्देशनाचा अधिकार (कलम १४): मृत्यू किंवा असमर्थतेच्या प्रसंगी अधिकार वापरण्यासाठी व्यक्तीची नियुक्ती करण्याचा अधिकार.

५. संमती मागे घेण्याचा अधिकार (कलम ६(४))
तुम्ही दिलेली संमती कोणत्याही वेळी मागे घेऊ शकता. संमती मागे घेण्यासाठी ${details.grievanceOfficerEmail} वर संपर्क साधावा.

६. तक्रार निवारण अधिकारी व नियामक तक्रार
- अधिकारी: ${details.grievanceOfficerName}
- ईमेल: ${details.grievanceOfficerEmail}
- पत्ता: ${details.grievanceAddress}

आपल्या तक्रारीचे निवारण विहित मुदतीत न झाल्यास, भारताच्या डेटा संरक्षण मंडळाकडे (DPBI) अधिकृत तक्रार दाखल करण्याचा अधिकार आपल्याला आहे.`;

  const htmlSnippet = `<div class="dpdp-consent-notice" style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.6; color: #27272a; padding: 16px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa;">
  <p style="font-weight: 600; margin-bottom: 8px;">डिजिटल वैयक्तिक डेटा संरक्षण कायदा, २०२३ अंतर्गत सूचना</p>
  <p style="margin-bottom: 8px;"><strong>${details.organizationName}</strong> आपली माहिती केवळ <em>${audit.purposeDescription}</em> या हेतूसाठी संकलित करत आहे.</p>
  <p style="margin-bottom: 8px;">तुम्ही केव्हाही <strong>${details.grievanceOfficerEmail}</strong> वर संपर्क साधून संमती मागे घेऊ शकता.</p>
  <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; cursor: pointer;">
    <input type="checkbox" required style="accent-color: #059669;" />
    <span>मी ही DPDP सूचना वाचली असून विहित हेतूसाठी माझ्या डेटा प्रक्रियेस संमती देत आहे.</span>
  </label>
</div>`;

  return {
    language: 'mr' as SupportedLanguage,
    title: 'मराठी DPDP संमती सूचना (Marathi Notice)',
    content,
    htmlSnippet,
  };
}
