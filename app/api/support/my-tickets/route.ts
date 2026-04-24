// app/api/support/my-tickets/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ticket: null });
  }

  const ticket = await prisma.supportConversation.findFirst({
    where: {
      customerEmail: session.user.email,
      status: 'open',
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { admin: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ ticket });
}