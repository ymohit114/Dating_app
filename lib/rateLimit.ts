import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class SlidingWindowRateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodic garbage collection every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  public check(identifier: string): { success: boolean; limit: number; remaining: number; resetMs: number } {
    const now = Date.now();
    const record = this.cache.get(identifier);

    if (!record || now > record.resetTime) {
      this.cache.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        resetMs: this.windowMs,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetMs: Math.max(0, record.resetTime - now),
      };
    }

    record.count += 1;
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      resetMs: Math.max(0, record.resetTime - now),
    };
  }

  private cleanup(): void {
    const now = Date.now();
    this.cache.forEach((record, key) => {
      if (now > record.resetTime) {
        this.cache.delete(key);
      }
    });
  }
}

// ── Rate Limiter Instances ────────────────────────────────────────────────────
// 1. Auth Rate Limiter: 10 attempts per 15 minutes per IP (Brute-Force defense)
export const authRateLimiter = new SlidingWindowRateLimiter(10, 15 * 60 * 1000);

// 2. Swipe Rate Limiter: 60 swipes per minute (Bot throttling)
export const swipeRateLimiter = new SlidingWindowRateLimiter(60, 60 * 1000);

// 3. Message Rate Limiter: 30 messages per minute (Chat spam protection)
export const messageRateLimiter = new SlidingWindowRateLimiter(30, 60 * 1000);

// 4. General API Rate Limiter: 120 requests per minute
export const generalApiLimiter = new SlidingWindowRateLimiter(120, 60 * 1000);

// ── Utility to extract Client IP address ──────────────────────────────────────
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

// ── HTTP 429 Response Builder ─────────────────────────────────────────────────
export function createRateLimitResponse(resetMs: number, customMessage?: string): NextResponse {
  const retrySeconds = Math.ceil(resetMs / 1000);
  const response = NextResponse.json(
    {
      error: customMessage || `Too many attempts. Please try again in ${retrySeconds} seconds.`,
      retryAfterSeconds: retrySeconds,
    },
    { status: 429 }
  );

  response.headers.set('Retry-After', retrySeconds.toString());
  response.headers.set('X-RateLimit-Reset', (Date.now() + resetMs).toString());
  return response;
}
