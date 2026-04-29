// lib/logger.ts
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

// Убедимся, что папка logs существует
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Уровни логирования
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Получить текущий уровень логирования из переменной окружения LOG_LEVEL
function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toUpperCase();
  if (level === 'DEBUG') return LogLevel.DEBUG;
  if (level === 'ERROR') return LogLevel.ERROR;
  return LogLevel.INFO; // по умолчанию INFO и выше
}

// Цвета для консоли (только в dev режиме)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  grey: '\x1b[90m',
};

function colorForLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG: return colors.grey;
    case LogLevel.INFO: return colors.cyan;
    case LogLevel.WARN: return colors.yellow;
    case LogLevel.ERROR: return colors.red;
    default: return colors.reset;
  }
}

function levelLabel(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG: return 'DEBUG';
    case LogLevel.INFO: return 'INFO';
    case LogLevel.WARN: return 'WARN';
    case LogLevel.ERROR: return 'ERROR';
    default: return 'UNKNOWN';
  }
}

/**
 * Основная функция логирования.
 * @param level - Уровень
 * @param message - Сообщение
 * @param meta - Дополнительные данные (любой тип)
 */
function log(level: LogLevel, message: string, meta?: unknown) {
  // Если уровень ниже текущего порога – игнорируем
  if (level < getLogLevel()) return;

  const timestamp = new Date().toISOString();
  const levelStr = levelLabel(level);
  const logFileName = `${levelStr.toLowerCase()}.log`;
  const logFilePath = path.join(LOG_DIR, logFileName);

  // Приводим meta к удобному для записи виду
  let metaObject: Record<string, unknown> = {};
  if (meta instanceof Error) {
    metaObject = { error: meta.message, stack: meta.stack };
  } else if (typeof meta === 'object' && meta !== null) {
    metaObject = meta as Record<string, unknown>;
  } else if (meta !== undefined) {
    // Если это примитив (строка, число, булево) – сохраним в поле "value"
    metaObject = { value: meta };
  }

  // Запись в файл (JSON-строка)
  const fileEntry = JSON.stringify({
    timestamp,
    level: levelStr,
    message,
    ...metaObject,
  }) + '\n';

  fs.appendFile(logFilePath, fileEntry, (err) => {
    if (err) {
      // Если не можем записать в лог-файл, выводим ошибку в консоль
      console.error('Failed to write to log file:', err);
    }
  });

  // Вывод в консоль (только в dev-режиме)
  if (process.env.NODE_ENV !== 'production') {
    const color = colorForLevel(level);
    const consoleMessage = `${colors.dim}[${timestamp}]${colors.reset} ${color}${levelStr}${colors.reset} ${message}`;
    // В консоль добавляем meta только если это есть (для Error покажем сообщение)
    if (meta instanceof Error) {
      console.log(consoleMessage, meta.message);
    } else if (meta !== undefined) {
      console.log(consoleMessage, meta);
    } else {
      console.log(consoleMessage);
    }
  }
}

// Удобные методы-обёртки
export const logger = {
  debug: (message: string, meta?: unknown) => log(LogLevel.DEBUG, message, meta),
  info: (message: string, meta?: unknown) => log(LogLevel.INFO, message, meta),
  warn: (message: string, meta?: unknown) => log(LogLevel.WARN, message, meta),
  error: (message: string, meta?: unknown) => log(LogLevel.ERROR, message, meta),
};