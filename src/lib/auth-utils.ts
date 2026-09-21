/**
 * Authentication and Redirection Security Utilities for OfficeX
 * Implements developer specifications from OfficeX_SignIn_Experience_Review.docx
 * and OFFICEX_Registration_Onboarding_Specification_Scalezix_v1.0.docx
 */

// Allowed internal paths that can be redirected to after sign-in (Anti-Open-Redirect)
export const ALLOWED_REDIRECT_PREFIXES = [
  '/dashboard',
  '/properties',
  '/property',
  '/tenant',
  '/leasing',
  '/ops',
  '/operations',
  '/vendor',
  '/admin',
  '/operate',
  '/reporting',
  '/reports',
  '/discover',
  '/app',
  '/marketplace',
  '/fm-marketplace',
  '/public/search'
];

/**
 * Validates and sanitizes a redirect URL to prevent Open Redirect vulnerabilities.
 * Enforces strict relative-path matching against allowed prefixes.
 */
export function validateRedirect(
  redirectUrl: string | null | undefined,
  defaultFallback: string = '/properties'
): string {
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return defaultFallback;
  }

  const trimmed = redirectUrl.trim();

  // Must start with a single "/" and must NOT start with "//" (protocol-relative) or "/\"
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return defaultFallback;
  }

  // Reject any embedded protocol schemes (e.g. javascript:, http:, https:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.includes(':') || trimmed.includes('\\')) {
    return defaultFallback;
  }

  // Parse path without query strings or hashes for prefix checking
  const pathOnly = trimmed.split('?')[0].split('#')[0];

  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)
  );

  if (!isAllowed) {
    return defaultFallback;
  }

  return trimmed;
}

export type IdentifierType = 'email' | 'phone' | 'invalid';

/**
 * Detects whether the user entered a corporate email or a mobile number.
 */
export function detectIdentifierType(identifier: string): IdentifierType {
  const clean = identifier.trim();
  if (!clean) return 'invalid';

  // Check email format
  if (clean.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(clean) ? 'email' : 'invalid';
  }

  // Check phone number: 10 digits (India 6-9 prefix), +91, or international E.164
  const digitsOnly = clean.replace(/[\s\-()+]/g, '');

  // Indian 10-digit format starting with 6-9
  if (/^[6-9]\d{9}$/.test(digitsOnly)) {
    return 'phone';
  }

  // 12-digit format with 91 prefix
  if (/^91[6-9]\d{9}$/.test(digitsOnly)) {
    return 'phone';
  }

  // General E.164 format: 8 to 15 digits
  if (/^\d{8,15}$/.test(digitsOnly)) {
    return 'phone';
  }

  return 'invalid';
}

/**
 * Normalizes email to lowercase or phone to canonical E.164 format.
 */
export function normalizeIdentifier(identifier: string): string {
  const clean = identifier.trim();
  const type = detectIdentifierType(clean);

  if (type === 'email') {
    return clean.toLowerCase();
  }

  if (type === 'phone') {
    const digitsOnly = clean.replace(/[\s\-()+]/g, '');
    if (/^[6-9]\d{9}$/.test(digitsOnly)) {
      return `+91${digitsOnly}`;
    }
    if (/^91[6-9]\d{9}$/.test(digitsOnly)) {
      return `+${digitsOnly}`;
    }
    return clean.startsWith('+') ? `+${digitsOnly}` : `+91${digitsOnly}`;
  }

  return clean;
}

/**
 * Masks identifier for privacy in OTP & verification screens (e.g. "r•••i@acme.com" or "+91 98••• ••210").
 */
export function maskIdentifier(identifier: string): string {
  const clean = identifier.trim();
  const type = detectIdentifierType(clean);

  if (type === 'email') {
    const [user, domain] = clean.split('@');
    if (!domain) return clean;
    if (user.length <= 2) {
      return `${user[0]}•••@${domain}`;
    }
    return `${user[0]}•••${user[user.length - 1]}@${domain}`;
  }

  if (type === 'phone') {
    const digitsOnly = clean.replace(/[\s\-()+]/g, '');
    if (digitsOnly.length >= 10) {
      const lastFour = digitsOnly.slice(-4);
      const prefix = digitsOnly.startsWith('91') ? '+91' : (clean.startsWith('+') ? clean.slice(0, 3) : '+91');
      const middle = digitsOnly.length === 10 ? digitsOnly.slice(0, 2) : digitsOnly.slice(2, 4);
      return `${prefix} ${middle}••• ••${lastFour.slice(-3)}`;
    }
  }

  return clean;
}

// Workspace Membership representation across multi-org architectures
export interface WorkspaceMembership {
  id: string;
  orgId: string;
  orgName: string;
  role: string;
  roleCode: 'OWNER' | 'PM' | 'LEASING' | 'FM' | 'VENDOR' | 'TENANT' | 'ADMIN' | 'AUDITOR';
  workspaceTitle: string;
  workspaceUrl: string;
  propertyScope: string;
  badge: string;
  badgeColor: string;
  isLastUsed?: boolean;
}

// Enterprise organizations configured with SSO
export const ENTERPRISE_SSO_CONFIG: Record<string, { orgName: string; provider: string; ssoUrl: string }> = {
  'dlf.in': { orgName: 'DLF Cybercity Developers', provider: 'Azure AD / Microsoft Entra', ssoUrl: 'https://login.microsoftonline.com/dlf.in' },
  'tcs.com': { orgName: 'Tata Consultancy Services', provider: 'Okta Enterprise SSO', ssoUrl: 'https://tcs.okta.com' },
  'infosys.com': { orgName: 'Infosys CRE Infrastructure', provider: 'PingFederate SAML', ssoUrl: 'https://sso.infosys.com' },
  'cbre.com': { orgName: 'CBRE Global Commercial Services', provider: 'Microsoft Entra ID', ssoUrl: 'https://login.microsoftonline.com/cbre.com' },
  'jll.com': { orgName: 'JLL Corporate Solutions', provider: 'Workday SAML 2.0', ssoUrl: 'https://jll.okta.com' },
  'brookfieldproperties.com': { orgName: 'Brookfield Properties India', provider: 'Azure AD SAML', ssoUrl: 'https://login.microsoftonline.com/brookfield' }
};

// Mock User Directory matching personas defined in Section 03 & 20
export interface MockUserRecord {
  id: string;
  identifier: string; // email or phone
  name: string;
  requiresMfa: boolean;
  hasPassword: boolean;
  memberships: WorkspaceMembership[];
  preferredContextId?: string;
}

export const MOCK_USERS: Record<string, MockUserRecord> = {
  // Landlord & Asset Owner with multiple memberships across 2 orgs
  'owner@officex.in': {
    id: 'usr_owner_01',
    identifier: 'owner@officex.in',
    name: 'Ravi Singhal',
    requiresMfa: false,
    hasPassword: true,
    preferredContextId: 'mem_acme_owner',
    memberships: [
      {
        id: 'mem_acme_owner',
        orgId: 'org_acme',
        orgName: 'Acme Commercial Realty Ltd',
        role: 'Property Owner & Asset Manager',
        roleCode: 'OWNER',
        workspaceTitle: 'Commercial Landlord Desk',
        workspaceUrl: '/properties',
        propertyScope: '5 properties · Mumbai & Bengaluru',
        badge: 'Asset Owner',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        isLastUsed: true
      },
      {
        id: 'mem_acme_leasing',
        orgId: 'org_acme',
        orgName: 'Acme Commercial Realty Ltd',
        role: 'Commercial Leasing Director',
        roleCode: 'LEASING',
        workspaceTitle: 'Leasing & Occupancy Pipeline',
        workspaceUrl: '/leasing',
        propertyScope: 'All portfolio listings',
        badge: 'Leasing',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      },
      {
        id: 'mem_novatech_tenant',
        orgId: 'org_novatech',
        orgName: 'NovaTech Solutions India',
        role: 'Executive Board Member',
        roleCode: 'TENANT',
        workspaceTitle: 'Enterprise Workplace Portal',
        workspaceUrl: '/tenant',
        propertyScope: 'Apex Business Tower · Floor 5A',
        badge: 'Occupier',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
      }
    ]
  },
  'ravi@acme.com': {
    id: 'usr_owner_01',
    identifier: 'ravi@acme.com',
    name: 'Ravi Singhal',
    requiresMfa: false,
    hasPassword: true,
    preferredContextId: 'mem_acme_owner',
    memberships: [
      {
        id: 'mem_acme_owner',
        orgId: 'org_acme',
        orgName: 'Acme Commercial Realty Ltd',
        role: 'Property Owner & Asset Manager',
        roleCode: 'OWNER',
        workspaceTitle: 'Commercial Landlord Desk',
        workspaceUrl: '/properties',
        propertyScope: '5 properties · Mumbai & Bengaluru',
        badge: 'Asset Owner',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        isLastUsed: true
      },
      {
        id: 'mem_acme_leasing',
        orgId: 'org_acme',
        orgName: 'Acme Commercial Realty Ltd',
        role: 'Commercial Leasing Director',
        roleCode: 'LEASING',
        workspaceTitle: 'Leasing & Occupancy Pipeline',
        workspaceUrl: '/leasing',
        propertyScope: 'All portfolio listings',
        badge: 'Leasing',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      }
    ]
  },
  // Mobile user: Facility Operations Manager
  '+919876543210': {
    id: 'usr_fm_01',
    identifier: '+919876543210',
    name: 'Sunil Verma',
    requiresMfa: false,
    hasPassword: false, // Code/OTP primary
    preferredContextId: 'mem_apex_fm',
    memberships: [
      {
        id: 'mem_apex_fm',
        orgId: 'org_apex_fm',
        orgName: 'Apex Facilities Management',
        role: 'Facility Operations Manager',
        roleCode: 'FM',
        workspaceTitle: 'FM Command Centre',
        workspaceUrl: '/ops',
        propertyScope: 'Apex Business Tower & Nexus Park',
        badge: 'FM Ops',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        isLastUsed: true
      },
      {
        id: 'mem_acme_ops',
        orgId: 'org_acme',
        orgName: 'Acme Commercial Realty Ltd',
        role: 'Vendor Operations Lead',
        roleCode: 'VENDOR',
        workspaceTitle: 'Service Vendor Hub',
        workspaceUrl: '/vendor',
        propertyScope: 'MEP Maintenance Contract',
        badge: 'Vendor Hub',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      }
    ]
  },
  'facilitymanager@officex.in': {
    id: 'usr_fm_01',
    identifier: 'facilitymanager@officex.in',
    name: 'Sunil Verma',
    requiresMfa: false,
    hasPassword: true,
    preferredContextId: 'mem_apex_fm',
    memberships: [
      {
        id: 'mem_apex_fm',
        orgId: 'org_apex_fm',
        orgName: 'Apex Facilities Management',
        role: 'Facility Operations Manager',
        roleCode: 'FM',
        workspaceTitle: 'FM Command Centre',
        workspaceUrl: '/ops',
        propertyScope: 'Apex Business Tower & Nexus Park',
        badge: 'FM Ops',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        isLastUsed: true
      }
    ]
  },
  // Corporate Tenant Admin
  'tenant@officex.in': {
    id: 'usr_tenant_01',
    identifier: 'tenant@officex.in',
    name: 'Pooja Iyer',
    requiresMfa: false,
    hasPassword: true,
    memberships: [
      {
        id: 'mem_novatech_tenant',
        orgId: 'org_novatech',
        orgName: 'NovaTech Solutions HQ',
        role: 'Corporate Workplace Admin',
        roleCode: 'TENANT',
        workspaceTitle: 'Enterprise Workplace Portal',
        workspaceUrl: '/tenant',
        propertyScope: 'Apex Business Tower · Wings A & B',
        badge: 'Tenant Admin',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
        isLastUsed: true
      }
    ]
  },
  // Service Vendor
  'vendor@officex.in': {
    id: 'usr_vendor_01',
    identifier: 'vendor@officex.in',
    name: 'Karan Mehra',
    requiresMfa: false,
    hasPassword: true,
    memberships: [
      {
        id: 'mem_sterling_vendor',
        orgId: 'org_sterling_mep',
        orgName: 'Sterling MEP Services Ltd',
        role: 'Service Vendor Partner',
        roleCode: 'VENDOR',
        workspaceTitle: 'Vendor Operations & Bidding Hub',
        workspaceUrl: '/vendor',
        propertyScope: 'All Active Client Sites',
        badge: 'Service Vendor',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
        isLastUsed: true
      }
    ]
  },
  // Super Admin - Mandatory MFA
  'admin@officex.in': {
    id: 'usr_admin_01',
    identifier: 'admin@officex.in',
    name: 'Deepak Sharma (Admin)',
    requiresMfa: true, // Mandatory MFA required!
    hasPassword: true,
    memberships: [
      {
        id: 'mem_super_admin',
        orgId: 'org_officex_core',
        orgName: 'OfficeX Platform HQ',
        role: 'Super Administrator',
        roleCode: 'ADMIN',
        workspaceTitle: 'Super Admin Console',
        workspaceUrl: '/admin',
        propertyScope: 'Global Platform Ecosystem',
        badge: 'Super Admin',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
        isLastUsed: true
      }
    ]
  },
  // Leasing Broker
  'broker@officex.in': {
    id: 'usr_broker_01',
    identifier: 'broker@officex.in',
    name: 'Arjun Kapoor',
    requiresMfa: false,
    hasPassword: true,
    memberships: [
      {
        id: 'mem_leasing_broker',
        orgId: 'org_cbre',
        orgName: 'Apex Capital Advisors & Leasing',
        role: 'Senior Leasing Partner',
        roleCode: 'LEASING',
        workspaceTitle: 'Leasing Broker CRM',
        workspaceUrl: '/leasing',
        propertyScope: 'Commercial Agency Mandates',
        badge: 'Leasing Broker',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
        isLastUsed: true
      }
    ]
  }
};

/**
 * Finds mock user by email or normalized mobile number.
 */
export function findMockUser(identifier: string): MockUserRecord | null {
  const norm = normalizeIdentifier(identifier);
  if (MOCK_USERS[norm]) return MOCK_USERS[norm];

  // Try raw identifier
  const clean = identifier.trim().toLowerCase();
  if (MOCK_USERS[clean]) return MOCK_USERS[clean];

  // Match 10-digit mobile if entered with or without +91
  const digitsOnly = clean.replace(/[\s\-()+]/g, '');
  if (digitsOnly.length === 10) {
    const with91 = `+91${digitsOnly}`;
    if (MOCK_USERS[with91]) return MOCK_USERS[with91];
  }

  return null;
}

// Bilingual Localization Dictionary (English & Hindi)
// Addresses QA Checklist Item 31: "Hindi language toggle: All sign-in strings and OTP message in Hindi"
export const AUTH_LOCALES = {
  en: {
    title: 'Sign in to OfficeX',
    subtitle: 'Your buildings, operations and services — in one place.',
    identifierLabel: 'Work email or mobile number',
    identifierPlaceholder: 'name@company.com or 98765 43210',
    ssoEnabled: 'single sign-on enabled',
    continueBtn: 'Continue',
    checkingIdentifier: 'Checking identifier...',
    orDivider: 'or',
    continueWithMs: 'Continue with Microsoft',
    continueWithGoogle: 'Continue with Google',
    useCompanySso: 'Use company single sign-on (SSO)',
    cantSignIn: "Can't sign in?",
    newToOfficeX: 'New to OfficeX?',
    requestAccess: 'Register',
    privacy: 'Privacy',
    terms: 'Terms',
    security: 'Security',
    verifiedGateway: 'Verified Gateway',
    welcomeBack: 'Welcome back',
    changeIdentifier: 'Change',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    passwordPlaceholder: 'Enter your password',
    signInBtn: 'Sign in to OfficeX',
    verifying: 'Verifying...',
    sendCodeInstead: 'Try another method →',
    enterCode: 'Enter your code',
    codeSentOn: 'Sent on',
    to: 'to',
    neverShareCode: 'OfficeX will never ask you to share this code.',
    resendIn: 'Resend code in',
    sendBySms: 'Send by SMS instead',
    sendByWhatsApp: 'Send on WhatsApp instead',
    verifyAndSignIn: 'Verify and sign in',
    verifyingCode: 'Verifying code...',
    enterpriseSsoActive: 'Enterprise SSO Active',
    ssoDescription: 'Your organization enforces Single Sign-On (SAML / OIDC) for this domain.',
    continueWithOrgSso: 'Continue with Company SSO',
    confirmItsYou: "Confirm it's you",
    mfaDescription: 'Enter the 6-digit code from your authenticator app (TOTP).',
    trustThisDevice: 'Trust this device for 30 days (not on shared PCs)',
    confirmMfaBtn: 'Confirm & Sign In',
    whereToWork: 'Where would you like to work today?',
    switchAnytimeNotice: 'You can switch anytime from the top bar.',
    alwaysOpenWorkspace: 'Always open this workspace',
    openWorkspaceBtn: 'Open workspace',
    recoveryTitle: 'Account Recovery',
    recoverySubtitle: 'Enter your work email or mobile number to receive a secure recovery code.',
    sendRecoveryCode: 'Send Recovery Code',
    newPasswordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm New Password',
    resetPasswordBtn: 'Reset Password & Sign In',
    revokeOtherSessions: 'Sign out of all other devices',
    backToLogin: 'Back to Sign In'
  },
  hi: {
    title: 'OfficeX में साइन इन करें',
    subtitle: 'आपकी इमारतें, परिचालन और सेवाएँ — एक ही स्थान पर।',
    identifierLabel: 'कार्य ईमेल या मोबाइल नंबर',
    identifierPlaceholder: 'name@company.com या 98765 43210',
    ssoEnabled: 'सिंगल साइन-ऑन उपलब्ध',
    continueBtn: 'आगे बढ़ें',
    checkingIdentifier: 'जांच जारी है...',
    orDivider: 'या',
    continueWithMs: 'Microsoft के साथ साइन इन करें',
    continueWithGoogle: 'Google के साथ साइन इन करें',
    useCompanySso: 'कंपनी सिंगल साइन-ऑन (SSO) का उपयोग करें',
    cantSignIn: 'साइन इन करने में परेशानी?',
    newToOfficeX: 'OfficeX पर नए हैं?',
    requestAccess: 'पंजीकरण करें',
    privacy: 'गोपनीयता',
    terms: 'नियम',
    security: 'सुरक्षा',
    verifiedGateway: 'सत्यापित गेटवे',
    welcomeBack: 'वापसी पर स्वागत है',
    changeIdentifier: 'बदलें',
    passwordLabel: 'पासवर्ड',
    forgotPassword: 'पासवर्ड भूल गए?',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    signInBtn: 'OfficeX में साइन इन करें',
    verifying: 'सत्यापन जारी...',
    sendCodeInstead: 'अन्य विधि आज़माएं →',
    enterCode: 'अपना कोड दर्ज करें',
    codeSentOn: 'कोड भेजा गया',
    to: 'को',
    neverShareCode: 'OfficeX आपसे कभी यह कोड साझा करने के लिए नहीं कहेगा।',
    resendIn: 'पुनः भेजें',
    sendBySms: 'इसके बजाय SMS द्वारा भेजें',
    sendByWhatsApp: 'इसके बजाय WhatsApp पर भेजें',
    verifyAndSignIn: 'सत्यापित करें और साइन इन करें',
    verifyingCode: 'कोड सत्यापित हो रहा है...',
    enterpriseSsoActive: 'एंटरप्राइज SSO सक्रिय',
    ssoDescription: 'आपका संगठन इस डोमेन के लिए सिंगल साइन-ऑन अनिवार्य करता है।',
    continueWithOrgSso: 'कंपनी SSO के साथ आगे बढ़ें',
    confirmItsYou: 'पुष्टि करें कि यह आप हैं',
    mfaDescription: 'अपने प्रमाणक ऐप (TOTP) से 6-अंकीय कोड दर्ज करें।',
    trustThisDevice: 'इस डिवाइस पर 30 दिनों के लिए विश्वास करें',
    confirmMfaBtn: 'पुष्टि करें और साइन इन करें',
    whereToWork: 'आज आप कहाँ कार्य करना चाहेंगे?',
    switchAnytimeNotice: 'आप शीर्ष पट्टी से कभी भी बदल सकते हैं।',
    alwaysOpenWorkspace: 'हमेशा यह कार्यक्षेत्र खोलें',
    openWorkspaceBtn: 'कार्यक्षेत्र खोलें',
    recoveryTitle: 'खाता पुनर्प्राप्ति',
    recoverySubtitle: 'सुरक्षित कोड प्राप्त करने के लिए कार्य ईमेल या मोबाइल दर्ज करें।',
    sendRecoveryCode: 'रिकवरी कोड भेजें',
    newPasswordLabel: 'नया पासवर्ड',
    confirmPasswordLabel: 'नए पासवर्ड की पुष्टि करें',
    resetPasswordBtn: 'पासवर्ड रीसेट करें और साइन इन करें',
    revokeOtherSessions: 'अन्य सभी डिवाइस से साइन आउट करें',
    backToLogin: 'साइन इन पर वापस जाएं'
  }
};
