// app/api/support/conversations/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await prisma.supportConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { admin: { select: { name: true, email: true } } },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Разговор не найден' }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
  }

  const conversation = await prisma.supportConversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: 'Разговор не найден' }, { status: 404 });
  }

  const newMsg = await prisma.supportMessage.create({
    data: {
      conversationId: id,
      senderType: 'customer',
      message,
    },
  });

  return NextResponse.json(newMsg, { status: 201 });
}