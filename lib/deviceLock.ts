import { NextResponse } from 'next/server';

export const ADMIN_DEVICE_COOKIE = 'elance_admin_device_key';
export const ADMIN_DEVICE_SECRET = process.env.ADMIN_DEVICE_SECRET || 'elance_authorized_laptop_master_key_8f3a9e2c1b7d';

/**
 * Checks whether the incoming request originates from this authorized laptop/device.
 */
export function isAuthorizedAdminDevice(req: Request | any): boolean {
  // 1. Check if the request is from localhost / 127.0.0.1 (This laptop)
  const host = req.headers.get ? req.headers.get('host') || '' : req.headers?.host || '';
  const forwarded = req.headers.get ? req.headers.get('x-forwarded-for') || '' : req.headers?.['x-forwarded-for'] || '';
  
  const isLocalHost = 
    host.startsWith('localhost:') || 
    host === 'localhost' || 
    host.startsWith('127.0.0.1:') || 
    host === '127.0.0.1' ||
    forwarded === '127.0.0.1' ||
    forwarded === '::1';

  // 2. Check for Master Device Cookie or Header
  let deviceCookie = '';
  if (req.cookies?.get) {
    deviceCookie = req.cookies.get(ADMIN_DEVICE_COOKIE)?.value || '';
  } else if (req.headers?.get) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${ADMIN_DEVICE_COOKIE}=([^;]+)`));
    if (match) deviceCookie = match[1];
  }

  const deviceHeader = req.headers?.get ? req.headers.get('x-admin-device-key') || '' : req.headers?.['x-admin-device-key'] || '';

  const hasValidSecret = 
    deviceCookie === ADMIN_DEVICE_SECRET || 
    deviceHeader === ADMIN_DEVICE_SECRET;

  return isLocalHost || hasValidSecret;
}

/**
 * Sets the long-lived Device Lock Cookie to permanently authorize this browser/laptop.
 */
export function setDeviceLockCookie(headers: Headers): void {
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    `${ADMIN_DEVICE_COOKIE}=${ADMIN_DEVICE_SECRET}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `HttpOnly`,
    `SameSite=Strict`,
  ];

  if (isProd) {
    cookieOptions.push('Secure');
  }

  headers.append('Set-Cookie', cookieOptions.join('; '));
}
