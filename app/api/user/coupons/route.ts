// app/api/user/coupons/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const coupons = await prisma.userCoupon.findMany({
    where: { userId: session.user.id },
    include: {
      coupon: true,
    },
    orderBy: { assignedAt: 'desc' },
  });

  return NextResponse.json({ coupons });
}