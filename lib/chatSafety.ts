/**
 * Chat Safety & Sensitive Content Filter
 * Detects and masks phone numbers, UPI payment handles, and financial scam keywords in real-time chat.
 */

// Common Indian mobile patterns: 10 digits starting with 6,7,8,9, optional +91 or 0, with spaces/dots/dashes
const PHONE_REGEX = /(\+?91[\s.-]?)?[6-9]\d{1}[\s.-]?\d{4}[\s.-]?\d{4}|\b[6-9]\d{9}\b/g;

// Common UPI handles
const UPI_REGEX = /[a-zA-Z0-9.\-_]{2,256}@(okhdfcbank|okaxis|okicici|oksbi|ybl|paytm|upi|axl|ibl|sbi|icici|barodampay|kotak|federal|idfcbank|freecharge|postbank|aubank)/gi;

// Financial fraud / phishing keywords
const SUSPICIOUS_PATTERNS = [
  /\b(send otp|share otp|tell me otp|give otp)\b/i,
  /\b(send money first|transfer amount|google pay me|paytm karo)\b/i,
  /\b(crypto trading|investment plan|earn daily \d+|double money)\b/i,
  /\b(t\.me\/[a-zA-Z0-9_]+|telegram\.me\/[a-zA-Z0-9_]+)\b/i,
];

export interface SafetyAnalysisResult {
  isSafe: boolean;
  containsPhone: boolean;
  containsUpi: boolean;
  containsSuspiciousContent: boolean;
  maskedText: string;
  warningNotice?: string;
}

export function analyzeMessageSafety(text: string): SafetyAnalysisResult {
  if (!text || typeof text !== 'string') {
    return {
      isSafe: true,
      containsPhone: false,
      containsUpi: false,
      containsSuspiciousContent: false,
      maskedText: '',
    };
  }

  let masked = text;
  let containsPhone = false;
  let containsUpi = false;
  let containsSuspiciousContent = false;

  // 1. Detect & Mask Phone Numbers
  if (PHONE_REGEX.test(masked)) {
    containsPhone = true;
    masked = masked.replace(PHONE_REGEX, '••••••••••');
  }

  // 2. Detect & Mask UPI IDs
  if (UPI_REGEX.test(masked)) {
    containsUpi = true;
    masked = masked.replace(UPI_REGEX, '•••••@upi');
  }

  // 3. Detect Suspicious Phishing / Scam keywords
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(masked)) {
      containsSuspiciousContent = true;
      break;
    }
  }

  let warningNotice: string | undefined;
  if (containsPhone || containsUpi) {
    warningNotice = '⚠️ Safety Tip: Never share personal phone numbers or payment handles with users you have just met.';
  } else if (containsSuspiciousContent) {
    warningNotice = '🛡️ Security Alert: Elance will never ask for OTPs or financial transfers.';
  }

  return {
    isSafe: !containsPhone && !containsUpi && !containsSuspiciousContent,
    containsPhone,
    containsUpi,
    containsSuspiciousContent,
    maskedText: masked,
    warningNotice,
  };
}
