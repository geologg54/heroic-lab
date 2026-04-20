// app/api/admin/settings/[key]/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clearSettingsCache } from '@/lib/settings'

// GET /api/admin/settings/[key] – получить одну настройку
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { key } = await params
  const setting = await prisma.setting.findUnique({
    where: { key },
  })

  return NextResponse.json({ value: setting?.value || '' })
}

// PUT /api/admin/settings/[key] – обновить одну настройку
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { key } = await params
  const { value } = await request.json()

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  clearSettingsCache()

  return NextResponse.json({ success: true })
}