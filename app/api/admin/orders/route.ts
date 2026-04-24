// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getOrderStatusUpdateEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

// GET – список заказов с расширенными фильтрами и сортировкой
export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { searchParams } = new URL(request.url)

  // --- Параметры фильтрации ---
  const search = searchParams.get('search') || ''
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const minTotal = searchParams.get('minTotal')
  const maxTotal = searchParams.get('maxTotal')
  const status = searchParams.get('status') || undefined

  // --- Параметры сортировки ---
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (search) {
    const isNumeric = /^\d+$/.test(search)
    if (isNumeric) {
      where.orderNumber = parseInt(search)
    } else {
      where.OR = [
        { user: { email: { contains: search } } },
        { guestEmail: { contains: search } }
      ]
    }
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = endDate
    }
  }

  if (minTotal || maxTotal) {
    where.total = {}
    if (minTotal) {
      where.total.gte = parseInt(minTotal)
    }
    if (maxTotal) {
      where.total.lte = parseInt(maxTotal)
    }
  }

  let orderBy: any = {}
  switch (sortBy) {
    case 'orderNumber':
      orderBy = { orderNumber: order }
      break
    case 'total':
      orderBy = { total: order }
      break
    case 'createdAt':
      orderBy = { createdAt: order }
      break
    case 'status':
      orderBy = { status: order }
      break
    default:
      orderBy = { createdAt: 'desc' }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy,
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  const formattedOrders = orders.map(order => ({
    ...order,
    customerName: order.user?.name || order.guestName || order.guestEmail || 'Гость',
    customerEmail: order.user?.email || order.guestEmail,
  }))

  return NextResponse.json({ orders: formattedOrders })
}

// PATCH – массовое обновление статусов и отправка уведомлений
export async function PATCH(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const body = await request.json()
  const { orderIds, newStatus, sendNotifications } = body

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ error: 'Не выбрано ни одного заказа' }, { status: 400 })
  }
  if (!newStatus) {
    return NextResponse.json({ error: 'Не указан новый статус' }, { status: 400 })
  }

  // Допустимые статусы (включая новый 'in_delivery')
  const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'in_delivery']
  if (!allowedStatuses.includes(newStatus)) {
    return NextResponse.json({ error: 'Недопустимый статус' }, { status: 400 })
  }

  const updateResult = await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { status: newStatus }
  })

  if (sendNotifications) {
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { user: true }
    })

    for (const order of orders) {
      const customerEmail = order.user?.email || order.guestEmail
      if (customerEmail) {
        const { subject, text } = await getOrderStatusUpdateEmail(order)
        sendEmail({
          to: customerEmail,
          subject,
          text
        }).catch(err => console.error('Ошибка отправки уведомления:', err))
      }
    }
  }

  return NextResponse.json({
    success: true,
    updatedCount: updateResult.count
  })
}

// PUT – обновление одного заказа (статус) с логированием
export async function PUT(request: Request) {
  // Получаем сессию и проверяем права администратора
  let session;
  try {
    session = await requireAdmin();
  } catch (error) {
    return error;
  }

  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Не указан ID заказа или статус' }, { status: 400 });
  }

  const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'in_delivery'];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Недопустимый статус' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: true,
      items: { include: { product: true } },
    },
  });

  // Логируем изменение статуса в файл info.log
  logger.info(`Статус заказа №${order.orderNumber} изменён на ${status}`, {
    adminId: session.user.id,
    orderId: id,
    newStatus: status,
  });

  return NextResponse.json(order);
}