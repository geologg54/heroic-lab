// app/api/admin/products/export/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { article: 'asc' }
  })

  // Заголовки колонок (добавлен 'images')
  const headers = [
    'article', 'name', 'price', 'oldPrice', 'categorySlug', 'description',
    'gameSystem', 'scale', 'type', 'faction', 'fileFormat', 'tags', 'images', 'featured'
  ]

  const rows = products.map(p => [
    p.article,
    `"${p.name.replace(/"/g, '""')}"`,
    p.price,
    p.oldPrice || '',
    p.category.slug,
    `"${p.description.replace(/"/g, '""')}"`,
    p.gameSystem,
    p.scale,
    p.type,
    p.faction || '',
    p.fileFormat,
    `"${p.tags.replace(/"/g, '""')}"`,
    `"${p.images.replace(/"/g, '""')}"`,  // ← колонка images
    p.featured ? 'true' : 'false'
  ])

  const separator = ';'
  const csvContent = [
    headers.join(separator),
    ...rows.map(row => row.join(separator))
  ].join('\n')

  const BOM = '\uFEFF'
  const finalContent = BOM + csvContent

  return new NextResponse(finalContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products_export.csv"'
    }
  })
}