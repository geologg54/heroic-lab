// lib/trustedDevice.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me';
const TRUSTED_DEVICE_COOKIE_NAME = '2fa_trusted';
const TRUST_DURATION_DAYS = 30;

export function generateTrustedToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: `${TRUST_DURATION_DAYS}d` });
}

export function verifyTrustedToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export function getTrustedCookieName(): string {
  return TRUSTED_DEVICE_COOKIE_NAME;
}

export function getTrustedCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}