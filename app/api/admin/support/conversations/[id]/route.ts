// app/api/admin/support/conversations/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (error) {
    return error;
  }

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
    return NextResponse.json({ error: 'Тикет не найден' }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireAdmin();
  } catch (error) {
    return error;
  }

  const { id } = await params;
  const body = await request.json();
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
  }

  const newMessage = await prisma.supportMessage.create({
    data: {
      conversationId: id,
      senderType: 'admin',
      adminId: session.user.id,
      message,
    },
    include: { admin: { select: { name: true } } },
  });

  // Обновляем время последнего сообщения у тикета
  await prisma.supportConversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(newMessage, { status: 201 });
}