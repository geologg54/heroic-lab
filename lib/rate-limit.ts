// lib/rate-limit.ts
interface RateLimitEntry {
  count: number
  firstAttempt: number
  blockedUntil?: number
}

// Хранилище в памяти (очищается при перезапуске сервера)
const store = new Map<string, RateLimitEntry>()

// Настройки
const MAX_ATTEMPTS = 5        // максимум попыток
const WINDOW_MS = 15 * 60 * 1000 // 15 минут в миллисекундах
const BLOCK_DURATION_MS = 15 * 60 * 1000 // блокировка на 15 минут

/**
 * Проверяет, не превышен ли лимит попыток с данного IP.
 * Возвращает объект с результатом.
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; message?: string } {
  const now = Date.now()
  const entry = store.get(ip)

  // Если записи нет — создаём новую
  if (!entry) {
    store.set(ip, { count: 1, firstAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  // Если IP заблокирован и блокировка ещё действует
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const minutesLeft = Math.ceil((entry.blockedUntil - now) / 60000)
    return { 
      allowed: false, 
      remaining: 0, 
      message: `Слишком много попыток. Попробуйте через ${minutesLeft} мин.` 
    }
  }

  // Если окно истекло или блокировка снята — сбрасываем
  if (now - entry.firstAttempt > WINDOW_MS) {
    store.set(ip, { count: 1, firstAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  // Иначе увеличиваем счётчик
  const newCount = entry.count + 1
  if (newCount > MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS
    store.set(ip, entry)
    return { 
      allowed: false, 
      remaining: 0, 
      message: `Превышен лимит попыток. Доступ заблокирован на 15 минут.` 
    }
  }

  entry.count = newCount
  store.set(ip, entry)
  return { allowed: true, remaining: MAX_ATTEMPTS - newCount }
}

// Периодическая очистка устаревших записей (чтобы не забивать память)
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of store.entries()) {
    if (now - entry.firstAttempt > WINDOW_MS && (!entry.blockedUntil || now > entry.blockedUntil)) {
      store.delete(ip)
    }
  }
}, 5 * 60 * 1000) // каждые 5 минут