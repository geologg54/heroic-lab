// app/api/admin/support/conversations/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    return error;
  }

  const conversations = await prisma.supportConversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(conversations);
}