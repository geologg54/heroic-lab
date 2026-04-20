// app/api/user/2fa/verify/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { verifyTOTP } from '@/lib/twoFactor';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { token } = await request.json();
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Код не предоставлен' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true },
  });

  if (!user?.twoFactorSecret) {
    return NextResponse.json({ error: '2FA не была инициирована' }, { status: 400 });
  }

  const isValid = verifyTOTP(token, user.twoFactorSecret);
  if (!isValid) {
    return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
  }

  // Активируем 2FA
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ success: true });
}