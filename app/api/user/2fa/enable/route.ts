// app/api/user/2fa/enable/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSecret, generateOTPAuthURL, generateQRCodeDataURL } from '@/lib/twoFactor';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const userId = session.user.id;

  // Генерируем новый секрет
  const secret = generateSecret();
  const otpauthUrl = generateOTPAuthURL(session.user.email, secret);
  const qrCodeDataURL = await generateQRCodeDataURL(otpauthUrl);

  // Сохраняем секрет в базе (но пока не включаем 2FA)
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  return NextResponse.json({ qrCode: qrCodeDataURL, secret });
}