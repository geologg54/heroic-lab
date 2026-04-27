// lib/vkNotifications.ts
import { logger } from './logger';

const VK_API_URL = 'https://api.vk.com/method/messages.send';
const VK_API_VERSION = '5.199';

// Вспомогательная функция: получить массив ID администраторов (уже есть)
function getAdminPeerIds(): string[] {
  const raw = process.env.VK_ADMIN_PEER_ID;
  if (!raw) return [];
  return raw.split(',').map(id => id.replace(/^id/i, '').trim()).filter(Boolean);
}

// Базовая отправка одному адресату (уже есть)
async function sendVKMessage(peerId: string, message: string): Promise<boolean> {
  const token = process.env.VK_BOT_TOKEN;
  if (!token || !peerId) return false;

  try {
    const params = new URLSearchParams({
      access_token: token,
      v: VK_API_VERSION,
      peer_id: peerId,
      message: message,
      random_id: Math.floor(Math.random() * 100000000).toString(),
    });
    const response = await fetch(`${VK_API_URL}?${params.toString()}`, { method: 'POST' });
    const data = await response.json();
    if (data.error) {
      logger.error(`VK send error to ${peerId}: ${data.error.error_msg}`, {
        error_code: data.error.error_code,
      });
      return false;
    }
    return true;
  } catch (error: any) {
    logger.error(`VK network error to ${peerId}: ${error.message}`);
    return false;
  }
}

// Отправка всем админам (уже есть)
export async function sendVKAdminNotification(message: string): Promise<void> {
  const peerIds = getAdminPeerIds();
  for (const peerId of peerIds) {
    await sendVKMessage(peerId, message).catch(console.error);
  }
}

// Сборка сообщения для нового тикета (уже есть)
export function buildNewTicketNotification(
  ticketNumber: string,
  customerName?: string | null,
  customerEmail?: string | null,
  message?: string
): string {
  const name = customerName || 'Гость';
  const contact = customerEmail ? ` (${customerEmail})` : '';
  const preview = message ? message.slice(0, 100) + (message.length > 100 ? '...' : '') : '';
  return `📬 Новое обращение #${ticketNumber}\nОт: ${name}${contact}\nСообщение: ${preview}\nОтветьте в админ-панели.`;
}

// Отправка уведомления о новом сообщении в тикете (уже есть)
export async function sendNewMessageNotification(
  ticketNumber: string,
  conversationId: string,
  customerName?: string | null,
  customerEmail?: string | null,
  message?: string
): Promise<void> {
  const peerIds = getAdminPeerIds();
  const name = customerName || 'Клиент';
  const preview = message ? message.slice(0, 100) + (message.length > 100 ? '...' : '') : '';
  const text = `✉️ Новое сообщение в тикете #${ticketNumber}\nОт: ${name}\nСообщение: ${preview}\nОтветьте в админ-панели.`;
  for (const peerId of peerIds) {
    await sendVKMessage(peerId, text).catch(console.error);
  }
}

// Отправка напоминаний о непрочитанных тикетах (уже есть)
export async function sendUnreadReminderNotification(message: string): Promise<void> {
  const peerIds = getAdminPeerIds();
  for (const peerId of peerIds) {
    await sendVKMessage(peerId, message).catch(console.error);
  }
}

// ========== НОВАЯ ФУНКЦИЯ ДЛЯ ЗАКАЗОВ ==========

/**
 * Формирует сообщение о новом заказе для отправки в VK.
 * @param order - объект заказа с полями: orderNumber, total, createdAt, items (с product.name, quantity, priceAtPurchase),
 *                customerName, customerEmail, phone, address, deliveryMethod, paymentMethod
 */
export function buildNewOrderNotification(order: any): string {
  const itemsList = order.items
    .map((item: any) => `${item.product.name} × ${item.quantity} = ${item.priceAtPurchase * item.quantity} ₽`)
    .join('\n');
  const total = order.total;
  const number = order.orderNumber;
  const customer = order.user?.name || order.guestName || order.guestEmail || 'Гость';
  const email = order.user?.email || order.guestEmail || 'не указан';
  const phone = order.phone || 'не указан';
  const address = order.address;
  const delivery = order.deliveryMethod || 'не указан';
  const payment = order.paymentMethod || 'не указан';
  const comment = order.comment || 'нет';
  const date = new Date(order.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  return (
    `🛒 Новый заказ №${number}\n` +
    `Дата: ${date}\n` +
    `Сумма: ${total} ₽\n` +
    `Покупатель: ${customer}\n` +
    `Email: ${email}\n` +
    `Телефон: ${phone}\n` +
    `Адрес: ${address}\n` +
    `Доставка: ${delivery}\n` +
    `Оплата: ${payment}\n` +
    `Комментарий: ${comment}\n\n` +
    `Состав заказа:\n${itemsList}\n\n` +
    `Перейти в админ-панель: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders`
  );
}