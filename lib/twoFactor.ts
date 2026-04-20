// lib/twoFactor.ts
import * as otplib from 'otplib';
import QRCode from 'qrcode';

// @ts-ignore - в текущей версии otplib экспорт немного отличается, но метод работает
const { authenticator } = otplib;

authenticator.options = {
  step: 30,
  digits: 6,
};

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function generateOTPAuthURL(email: string, secret: string): string {
  const serviceName = 'HeroicLab';
  return authenticator.keyuri(email, serviceName, secret);
}

export async function generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUrl);
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}