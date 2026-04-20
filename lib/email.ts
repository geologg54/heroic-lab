// lib/email.ts
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { getSetting } from './settings'

// Настройки SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

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

// Вспомогательные функции для подстановки переменных
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    processing: 'В работе',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }
  return labels[status] || status
}

function formatItemsList(order: any): string {
  return order.items.map((item: any) =>
    `${item.product.name} x ${item.quantity} = ${item.priceAtPurchase * item.quantity} ₽`
  ).join('\n')
}

/**
 * Шаблон письма для администратора о новом заказе.
 * Использует настройки email_admin_new_order_subject и email_admin_new_order_body.
 */
export async function getNewOrderAdminEmail(order: any) {
  const customerName = order.user?.name || order.guestName || order.guestEmail || 'Гость'
  const customerEmail = order.user?.email || order.guestEmail || 'не указан'
  const itemsList = formatItemsList(order)

  const subject = await getSetting(
    'email_admin_new_order_subject',
    `Новый заказ №${order.orderNumber} на сайте`
  )

  let body = await getSetting(
    'email_admin_new_order_body',
    `Новый заказ на сайте!\n\n` +
    `Номер заказа: {{orderNumber}}\n` +
    `Дата: {{createdAt}}\n` +
    `Сумма: {{total}} ₽\n` +
    `Покупатель: {{customerName}}\n` +
    `Email: {{customerEmail}}\n` +
    `Телефон: {{phone}}\n` +
    `Адрес доставки: {{address}}\n` +
    `Способ доставки: {{deliveryMethod}}\n` +
    `Способ оплаты: {{paymentMethod}}\n` +
    `Комментарий: {{comment}}\n\n` +
    `Состав заказа:\n{{itemsList}}\n\n` +
    `Ссылка на заказ в админке: ${process.env.NEXTAUTH_URL}/admin/orders`
  )

  body = body
    .replace(/{{orderNumber}}/g, order.orderNumber.toString())
    .replace(/{{createdAt}}/g, new Date(order.createdAt).toLocaleString('ru-RU'))
    .replace(/{{total}}/g, order.total.toString())
    .replace(/{{customerName}}/g, customerName)
    .replace(/{{customerEmail}}/g, customerEmail)
    .replace(/{{phone}}/g, order.phone || 'не указан')
    .replace(/{{address}}/g, order.address)
    .replace(/{{deliveryMethod}}/g, order.deliveryMethod || 'не указан')
    .replace(/{{paymentMethod}}/g, order.paymentMethod || 'не указан')
    .replace(/{{comment}}/g, order.comment || 'нет')
    .replace(/{{itemsList}}/g, itemsList)

  return { subject, text: body }
}

/**
 * Шаблон письма для покупателя (подтверждение заказа).
 * Использует настройки email_order_confirmation_subject и email_order_confirmation_body.
 */
export async function getOrderConfirmationEmail(order: any) {
  const customerName = order.user?.name || order.guestName || 'покупатель'
  const itemsList = formatItemsList(order)

  const subject = await getSetting(
    'email_order_confirmation_subject',
    `Ваш заказ №${order.orderNumber} принят`
  )

  let body = await getSetting(
    'email_order_confirmation_body',
    `Здравствуйте, {{customerName}}!\n\n` +
    `Ваш заказ №{{orderNumber}} успешно оформлен и принят в работу.\n\n` +
    `Дата заказа: {{createdAt}}\n` +
    `Сумма заказа: {{total}} ₽\n` +
    `Адрес доставки: {{address}}\n` +
    `Телефон: {{phone}}\n` +
    `Способ доставки: {{deliveryMethod}}\n\n` +
    `Состав заказа:\n{{itemsList}}\n\n` +
    `Мы свяжемся с вами для подтверждения деталей.\n` +
    `Спасибо за заказ!\n\n` +
    `С уважением,\n` +
    `Героическая лаборатория миниатюр`
  )

  body = body
    .replace(/{{orderNumber}}/g, order.orderNumber.toString())
    .replace(/{{createdAt}}/g, new Date(order.createdAt).toLocaleString('ru-RU'))
    .replace(/{{total}}/g, order.total.toString())
    .replace(/{{customerName}}/g, customerName)
    .replace(/{{address}}/g, order.address)
    .replace(/{{phone}}/g, order.phone || 'не указан')
    .replace(/{{deliveryMethod}}/g, order.deliveryMethod || 'не указан')
    .replace(/{{itemsList}}/g, itemsList)

  return { subject, text: body }
}

/**
 * Шаблон письма при смене статуса заказа.
 * Использует настройки email_status_update_subject и email_status_update_body.
 */
export async function getOrderStatusUpdateEmail(order: any) {
  const customerName = order.user?.name || order.guestName || 'покупатель'

  const subject = await getSetting(
    'email_status_update_subject',
    `Статус заказа №${order.orderNumber} изменён`
  )

  let body = await getSetting(
    'email_status_update_body',
    `Здравствуйте, {{customerName}}!\n\n` +
    `Статус вашего заказа №{{orderNumber}} изменился на: {{status}}.\n\n` +
    `Вы можете следить за статусом заказа в личном кабинете: ${process.env.NEXTAUTH_URL}/account/orders\n\n` +
    `С уважением,\n` +
    `Героическая лаборатория миниатюр`
  )

  body = body
    .replace(/{{orderNumber}}/g, order.orderNumber.toString())
    .replace(/{{customerName}}/g, customerName)
    .replace(/{{status}}/g, getStatusLabel(order.status))

  return { subject, text: body }
}