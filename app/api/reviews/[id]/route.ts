// app/api/reviews/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { order: { select: { orderNumber: true, createdAt: true } } },
  });
  if (!review || review.userId !== session.user.id) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  }
  return NextResponse.json(review);
}