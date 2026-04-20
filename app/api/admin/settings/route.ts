// app/api/admin/settings/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearSettingsCache, loadSettingsCache } from '@/lib/settings'

// GET – получить все настройки в виде объекта { key: value }
export async function GET() {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const settings = await prisma.setting.findMany()
  const settingsMap: Record<string, string> = {}
  for (const { key, value } of settings) {
    settingsMap[key] = value
  }

  return NextResponse.json(settingsMap)
}

// PUT – обновить несколько настроек
export async function PUT(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const updates: Record<string, string> = await request.json()

  const promises = Object.entries(updates).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  )

  await Promise.all(promises)

  // Сбрасываем кеш, чтобы при следующем запросе загрузились новые значения
  clearSettingsCache()
  // Можно сразу загрузить заново (опционально)
  await loadSettingsCache()

  return NextResponse.json({ success: true })
}