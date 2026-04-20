// lib/settings.ts
import { prisma } from './prisma'

// Простой кеш в памяти
const cache = new Map<string, string>()
let cacheLoaded = false

/**
 * Загружает все настройки из БД в кеш.
 */
export async function loadSettingsCache() {
  const settings = await prisma.setting.findMany()
  cache.clear()
  for (const { key, value } of settings) {
    cache.set(key, value)
  }
  cacheLoaded = true
}

/**
 * Получить значение настройки по ключу.
 * Если кеш не загружен – загружает.
 */
export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  if (!cacheLoaded) {
    await loadSettingsCache()
  }
  return cache.get(key) ?? defaultValue
}

/**
 * Сбросить кеш (вызвать после обновления настроек).
 */
export function clearSettingsCache() {
  cache.clear()
  cacheLoaded = false
}