// app/api/user/2fa/disable/route.ts
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
  if (!token) {
    return NextResponse.json({ error: 'Код обязателен' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA не включена' }, { status: 400 });
  }
  if (!user.twoFactorSecret) {
    return NextResponse.json({ error: 'Секрет не найден' }, { status: 400 });
  }

  const isValid = verifyTOTP(token, user.twoFactorSecret);
  if (!isValid) {
    return NextResponse.json({ error: 'Неверный код' }, { status: 400 });
  }

  // Отключаем 2FA и удаляем секрет
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return NextResponse.json({ success: true });
}