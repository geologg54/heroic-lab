// app/api/admin/filter-config/export/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const configs = await prisma.filterConfig.findMany({
    orderBy: [{ categorySlug: 'asc' }, { sortOrder: 'asc' }],
  })

  const headers = ['categorySlug', 'filterField', 'title', 'type', 'parentField', 'parentValue', 'sortOrder']
  const rows = configs.map(c => [
    c.categorySlug,
    c.filterField,
    `"${c.title.replace(/"/g, '""')}"`,
    c.type,
    c.parentField || '',
    c.parentValue || '',
    c.sortOrder.toString()
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n')

  return new NextResponse('\uFEFF' + csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="filter_config.csv"',
    },
  })
}