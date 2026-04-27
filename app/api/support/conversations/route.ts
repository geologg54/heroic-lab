// app/api/support/conversations/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendVKAdminNotification, buildNewTicketNotification } from '@/lib/vkNotifications';

// Генерирует читаемый номер тикета: HM-XXXXXX
function generateTicketNumber(): string {
  const randomPart = randomBytes(3).toString('hex').toUpperCase();
  return `HM-${randomPart}`;
}

// Системное сообщение о режиме работы (можно вынести в настройки)
const WORKING_HOURS_MESSAGE =
  'Режим работы поддержки: ежедневно с 10:00 до 18:00.\n' +
  'Администратор уже получил уведомление и постарается ответить в течение 15 минут (в рабочее время).';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

  let customerEmail = '';
  let customerName: string | undefined;

  // Если пользователь авторизован – берём его email
  if (session?.user?.email) {
    customerEmail = session.user.email;
    customerName = session.user.name || undefined;
  } else {
    // Гость может указать email (необязательно)
    const email = body.email?.trim();
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
      }
      customerEmail = email.toLowerCase();
    }
    // Если не указал – customerEmail останется пустым
    customerName = body.name?.trim() || undefined;
  }

  const message = body.message?.trim();
  if (!message || message.length === 0) {
    return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
  }

  // Создаём тикет с двумя сообщениями: от пользователя и системное
  const conversation = await prisma.supportConversation.create({
    data: {
      ticketNumber: generateTicketNumber(),
      customerEmail,       // может быть пустым
      customerName,
      subject: message.substring(0, 100),
      messages: {
        create: [
          {
            senderType: 'customer',
            message,
          },
          {
            senderType: 'system',
            message: WORKING_HOURS_MESSAGE,
          },
        ],
      },
    },
    include: { messages: true },
  });

  // Отправляем уведомление администратору в VK (не ждём ответа, чтобы не задерживать клиента)
  sendVKAdminNotification(
    buildNewTicketNotification(
      conversation.ticketNumber,
      customerName,
      customerEmail || null,
      message
    )
  ).catch(err => console.error('VK notification failed:', err));

  // Для ответа берём только первое сообщение (пользовательское), остальные клиент подтянет отдельно
  return NextResponse.json(
    {
      ticketNumber: conversation.ticketNumber,
      id: conversation.id,
      message: conversation.messages[0], // сообщение пользователя
    },
    { status: 201 }
  );
}