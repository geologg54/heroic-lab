// lib/logger.ts
import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')

// Убедимся, что папка logs существует (на всякий случай)
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

/**
 * Простая запись сообщения в файл лога.
 * @param level - Уровень ('INFO', 'ERROR', 'WARN')
 * @param message - Сообщение
 * @param meta - Дополнительные данные (объект)
 */
export function log(level: 'INFO' | 'ERROR' | 'WARN', message: string, meta?: any) {
  const timestamp = new Date().toISOString()
  const logFile = path.join(LOG_DIR, `${level.toLowerCase()}.log`)
  
  let logEntry = `[${timestamp}] ${message}`
  if (meta) {
    // Если meta - это объект Error, извлечём стек
    if (meta instanceof Error) {
      logEntry += `\n${meta.stack || meta.message}`
    } else {
      logEntry += `\n${JSON.stringify(meta, null, 2)}`
    }
  }
  logEntry += '\n-----------------------------------\n'

  // Асинхронная запись, чтобы не блокировать основной поток
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Не удалось записать в лог-файл:', err)
    }
  })
  
  // Также дублируем в консоль для удобства разработки
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level}]`, message, meta || '')
  }
}

// Удобные функции-обёртки
export const logger = {
  info: (msg: string, meta?: any) => log('INFO', msg, meta),
  error: (msg: string, meta?: any) => log('ERROR', msg, meta),
  warn: (msg: string, meta?: any) => log('WARN', msg, meta),
}