// app/api/support/conversations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

// Генерирует читаемый номер тикета: HM-XXXXXX
function generateTicketNumber(): string {
  const randomPart = randomBytes(3).toString('hex').toUpperCase(); // 6 символов
  return `HM-${randomPart}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  let customerEmail: string;
  let customerName: string | undefined;

  // Определяем email отправителя
  if (session?.user?.email) {
    customerEmail = session.user.email;
    customerName = session.user.name || undefined;
  } else {
    if (!body.email || typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Укажите корректный email' }, { status: 400 });
    }
    customerEmail = body.email.trim().toLowerCase();
    customerName = body.name?.trim() || undefined;
  }

  const message = body.message?.trim();
  if (!message || message.length === 0) {
    return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
  }

  // Создаём разговор с уникальным номером
  const conversation = await prisma.supportConversation.create({
    data: {
      ticketNumber: generateTicketNumber(),
      customerEmail,
      customerName,
      subject: message.substring(0, 100), // первые 100 символов как тема
      messages: {
        create: {
          senderType: 'customer',
          message,
        },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json(
    {
      ticketNumber: conversation.ticketNumber,
      id: conversation.id,
      message: conversation.messages[0],
    },
    { status: 201 }
  );
}