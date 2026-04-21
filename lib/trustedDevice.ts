// lib/trustedDevice.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me';
const TRUSTED_DEVICE_COOKIE_NAME = '2fa_trusted';
const TRUST_DURATION_DAYS = 30;

export interface TrustedDevicePayload {
  userId: string;
  // можно добавить fingerprint, но пока обойдёмся
}

/**
 * Генерирует JWT токен для доверенного устройства.
 */
export function generateTrustedToken(userId: string): string {
  const payload: TrustedDevicePayload = { userId };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${TRUST_DURATION_DAYS}d`,
  });
}

/**
 * Проверяет и извлекает userId из токена.
 * Возвращает userId, если токен валиден, иначе null.
 */
export function verifyTrustedToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TrustedDevicePayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Возвращает имя куки для доверенного устройства.
 */
export function getTrustedCookieName(): string {
  return TRUSTED_DEVICE_COOKIE_NAME;
}

/**
 * Возвращает настройки куки (HttpOnly, Secure, SameSite).
 */
export function getTrustedCookieOptions(maxAge?: number): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict';
  path: string;
  maxAge?: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  };
}