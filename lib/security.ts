/**
 * Security & Sanitization Utilities
 * Protects against NoSQL injection, XSS vectors, and prototype pollution.
 */

/**
 * Strips HTML tags, script tags, javascript: protocols, and event handlers
 * from user inputs (bios, names, chat messages, prompts).
 */
export function sanitizeHtmlText(input: string | any): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags and contents
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove inline event handlers (e.g. onload=, onerror=, onclick=)
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: and data: pseudo-protocols
    .replace(/javascript:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    // Strip remaining basic HTML tags
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Recursively cleans query parameters and request bodies to neutralize
 * MongoDB operator injection attacks ($gt, $ne, $where, $regex, etc.)
 * and prototype pollution (__proto__, constructor).
 */
export function sanitizeMongoInput<T = any>(input: T): T {
  if (input === null || typeof input !== 'object') {
    if (typeof input === 'string') {
      return input.trim() as unknown as T;
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeMongoInput(item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    // Block Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    // Block MongoDB $-operator keys when passed from client inputs
    if (key.startsWith('$')) {
      continue;
    }

    cleaned[key] = sanitizeMongoInput(value);
  }

  return cleaned as T;
}

/**
 * Normalizes email address safely.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}
