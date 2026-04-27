// app/api/support/conversations/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewMessageNotification } from '@/lib/vkNotifications'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conversation = await prisma.supportConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { admin: { select: { name: true, email: true } } }
      }
    }
  })
  if (!conversation) {
    return NextResponse.json({ error: 'Разговор не найден' }, { status: 404 })
  }
  return NextResponse.json(conversation)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 })
  }

  const conversation = await prisma.supportConversation.findUnique({ where: { id } })
  if (!conversation) {
    return NextResponse.json({ error: 'Разговор не найден' }, { status: 404 })
  }

  const newMsg = await prisma.supportMessage.create({
    data: {
      conversationId: id,
      senderType: 'customer',
      message
    }
  })

  // --- Уведомление админам ---
  // Проверяем, есть ли непрочитанные сообщения (последнее чтение админом)
  const hasUnread = !conversation.adminLastReadAt ||
    newMsg.createdAt > conversation.adminLastReadAt

  if (hasUnread && isWithinNotifyWindowMSK()) {
    // получаем ticket для красивого сообщения
    const ticketNumber = conversation.ticketNumber
    const customerName = conversation.customerName || 'Клиент'
    const customerEmail = conversation.customerEmail || null
    // Отправляем уведомление всем админам
    sendNewMessageNotification(ticketNumber, id, customerName, customerEmail, message)
      .catch(err => console.error('VK new message notification error:', err))
  }

  return NextResponse.json(newMsg, { status: 201 })
}

// Проверка, что сейчас московское время между 08:00 и 22:00
function isWithinNotifyWindowMSK(): boolean {
  try {
    const now = new Date()
    const ms = now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
    const mskDate = new Date(ms)
    const hours = mskDate.getHours()
    return hours >= 8 && hours < 22
  } catch {
    return true // если не удалось определить – разрешаем
  }
}