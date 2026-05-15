// app/api/admin/filter-config/import/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return NextResponse.json({ error: 'Поддерживаются только CSV файлы' }, { status: 400 })
  }

  const text = await file.text()
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  if (lines.length < 2) {
    return NextResponse.json({ error: 'Файл должен содержать заголовок и хотя бы одну строку' }, { status: 400 })
  }

  const separator = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''))
  
  const requiredHeaders = ['categorySlug', 'filterField', 'title', 'type']
  const missing = requiredHeaders.filter(h => !headers.includes(h))
  if (missing.length > 0) {
    return NextResponse.json({ error: `Отсутствуют обязательные колонки: ${missing.join(', ')}` }, { status: 400 })
  }

  // Удаляем все существующие конфиги перед импортом (или можно обновлять)
  await prisma.filterConfig.deleteMany()

  let imported = 0
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''))
    if (values.length !== headers.length) {
      errors.push(`Строка ${i + 1}: неверное количество колонок`)
      continue
    }

    const record: Record<string, string> = {}
    headers.forEach((header, idx) => {
      record[header] = values[idx]
    })

    if (!record.categorySlug || !record.filterField || !record.title || !record.type) {
      errors.push(`Строка ${i + 1}: не заполнены обязательные поля`)
      continue
    }

    try {
      await prisma.filterConfig.create({
        data: {
          categorySlug: record.categorySlug.trim(),
          filterField: record.filterField.trim(),
          title: record.title.trim(),
          type: record.type.trim(),
          parentField: record.parentField?.trim() || null,
          parentValue: record.parentValue?.trim() || null,
          sortOrder: parseInt(record.sortOrder) || 0,
        },
      })
      imported++
    } catch (err: any) {
      errors.push(`Строка ${i + 1}: ${err.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    errors,
    message: `Импортировано ${imported} записей`,
  })
}