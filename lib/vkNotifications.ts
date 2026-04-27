const VK_API_URL = 'https://api.vk.com/method/messages.send';
const VK_API_VERSION = '5.199';

interface VKNotificationPayload {
  message: string;
}

/**
 * Отправляет сообщение администратору в VK.
 * @param message - текст сообщения
 * @returns true, если отправка успешна
 */
export async function sendVKAdminNotification(message: string): Promise<boolean> {
  const token = process.env.VK_BOT_TOKEN;
  const peerId = process.env.VK_ADMIN_PEER_ID;

  // Если не настроено – просто логируем и выходим
  if (!token || !peerId) {
    console.warn('VK уведомления не настроены (нет VK_BOT_TOKEN или VK_ADMIN_PEER_ID).');
    return false;
  }

  try {
    const params = new URLSearchParams({
      access_token: token,
      v: VK_API_VERSION,
      peer_id: peerId,
      message: message,
      random_id: Math.floor(Math.random() * 100000000).toString(), // обязательный параметр
    });

    const response = await fetch(`${VK_API_URL}?${params.toString()}`, {
      method: 'POST',
    });

    const data = await response.json();

    if (data.error) {
      console.error('Ошибка отправки VK уведомления:', data.error);
      return false;
    }

    console.log('VK уведомление отправлено администратору.');
    return true;
  } catch (error) {
    console.error('Ошибка сети при отправке VK уведомления:', error);
    return false;
  }
}

/**
 * Формирует текст уведомления для нового тикета поддержки.
 * @param ticketNumber - номер тикета (например, HM-ABCDEF)
 * @param customerName - имя клиента (может быть гость или без имени)
 * @param customerEmail - email клиента (может быть пустым)
 * @param message - первое сообщение
 * @returns готовый текст для VK
 */
export function buildNewTicketNotification(
  ticketNumber: string,
  customerName?: string | null,
  customerEmail?: string | null,
  message?: string
): string {
  const name = customerName || 'Гость';
  const contact = customerEmail ? ` (${customerEmail})` : '';
  const preview = message ? message.slice(0, 100) + (message.length > 100 ? '...' : '') : '';

  return `📬 Новое обращение #${ticketNumber}\n` +
         `От: ${name}${contact}\n` +
         `Сообщение: ${preview}\n\n` +
         `Ответить можно в админ-панели.`;
}