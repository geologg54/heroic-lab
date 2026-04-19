// lib/email.ts
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// Настройки SMTP берутся из переменных окружения
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true', // true для 465 порта
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

/**
 * Записывает ошибку отправки письма в лог-файл
 */
function logEmailError(error: unknown, context: { to: string; subject: string }) {
  const logDir = path.join(process.cwd(), 'logs')
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  const logFile = path.join(logDir, 'email-errors.log')
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] Ошибка отправки письма на ${context.to} (тема: ${context.subject})\n${error}\n\n`
  
  fs.appendFileSync(logFile, logEntry, 'utf-8')
}

/**
 * Отправляет письмо
 * @param to - email получателя
 * @param subject - тема письма
 * @param text - текстовое содержимое
 * @param html - HTML-содержимое (опционально)
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  // Если не указан адрес отправителя, пропускаем отправку (для разработки)
  if (!process.env.EMAIL_FROM) {
    console.warn('EMAIL_FROM is not set. Email will not be sent.')
    return
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    logEmailError(error, { to, subject })
    throw error
  }
}

/**
 * Возвращает читаемую метку статуса заказа
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    processing: 'В работе',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }
  return labels[status] || status
}

/**
 * Шаблон письма для нового заказа (администратору)
 */
export function getNewOrderAdminEmail(order: any) {
  const itemsList = order.items.map((item: any) =>
    `${item.product.name} x ${item.quantity} = ${item.priceAtPurchase * item.quantity} ₽`
  ).join('\n')

  return {
    subject: `Новый заказ №${order.orderNumber} на сайте`,
    text: `
Новый заказ на сайте!

Номер заказа: ${order.orderNumber}
Дата: ${new Date(order.createdAt).toLocaleString('ru-RU')}
Сумма: ${order.total} ₽
Покупатель: ${order.user?.name || order.guestName || order.guestEmail || 'Гость'}
Email: ${order.user?.email || order.guestEmail || 'не указан'}
Телефон: ${order.phone || 'не указан'}
Адрес доставки: ${order.address}
Способ доставки: ${order.deliveryMethod || 'не указан'}
Способ оплаты: ${order.paymentMethod || 'не указан'}
Комментарий: ${order.comment || 'нет'}

Состав заказа:
${itemsList}

Ссылка на заказ в админке: ${process.env.NEXTAUTH_URL}/admin/orders
    `,
  }
}

/**
 * Шаблон письма для покупателя (подтверждение заказа)
 */
export function getOrderConfirmationEmail(order: any) {
  const itemsList = order.items.map((item: any) =>
    `${item.product.name} x ${item.quantity} = ${item.priceAtPurchase * item.quantity} ₽`
  ).join('\n')

  return {
    subject: `Ваш заказ №${order.orderNumber} принят`,
    text: `
Здравствуйте, ${order.user?.name || order.guestName || 'покупатель'}!

Ваш заказ №${order.orderNumber} успешно оформлен и принят в работу.

Дата заказа: ${new Date(order.createdAt).toLocaleString('ru-RU')}
Сумма заказа: ${order.total} ₽
Адрес доставки: ${order.address}
Телефон: ${order.phone || 'не указан'}
Способ доставки: ${order.deliveryMethod || 'не указан'}

Состав заказа:
${itemsList}

Мы свяжемся с вами для подтверждения деталей.
Спасибо за заказ!

С уважением,
Героическая лаборатория миниатюр
    `,
  }
}

/**
 * Шаблон письма при смене статуса заказа
 */
export function getOrderStatusUpdateEmail(order: any) {
  return {
    subject: `Статус заказа №${order.orderNumber} изменён`,
    text: `
Здравствуйте, ${order.user?.name || order.guestName || 'покупатель'}!

Статус вашего заказа №${order.orderNumber} изменился на: ${getStatusLabel(order.status)}.

Вы можете следить за статусом заказа в личном кабинете: ${process.env.NEXTAUTH_URL}/account/orders

С уважением,
Героическая лаборатория миниатюр
    `,
  }
}       