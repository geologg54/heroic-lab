// lib/errorNotifier.ts
import { sendVKAdminNotification } from './vkNotifications';
import { sendEmail } from './email';
import { logger } from './logger';

/**
 * Отправляет уведомление об ошибке администратору в VK и на почту.
 * @param message - Краткое описание ошибки.
 * @param error - Объект ошибки (необязательно).
 */
export async function notifyError(message: string, error?: unknown) {
  // Формируем текст для VK
  let vkMessage = `⚠️ Ошибка на сайте:\n${message}`;
  if (error instanceof Error) {
    vkMessage += `\n\n${error.message}`;
    // Ограничим длину, чтобы не превысить лимит VK
    if (vkMessage.length > 4000) {
      vkMessage = vkMessage.substring(0, 4000) + '...';
    }
  }

  // Отправляем в VK (не ждём ответа, ошибки логируем)
  sendVKAdminNotification(vkMessage).catch(err => {
    logger.error('Ошибка отправки уведомления об ошибке в VK', err);
  });

  // Отправляем на почту администратора
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const emailBody =
      `Произошла ошибка на сайте:\n\n${message}\n\n` +
      (error instanceof Error
        ? `Ошибка: ${error.message}\nСтек: ${error.stack || 'отсутствует'}`
        : '');

    sendEmail({
      to: adminEmail,
      subject: `Ошибка на сайте: ${message.substring(0, 50)}`,
      text: emailBody,
    }).catch(err => {
      logger.error('Ошибка отправки email-уведомления об ошибке', err);
    });
  }
}