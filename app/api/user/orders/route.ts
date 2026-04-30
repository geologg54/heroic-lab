// app/api/user/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const where: any = { userId: session.user.id };
  if (status) where.status = status;

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Ошибка получения заказов пользователя:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}