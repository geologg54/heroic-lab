// app/api/admin/products/export/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  const { searchParams } = new URL(request.url)
  const articlesParam = searchParams.get('articles')

  const where: any = {}
  if (articlesParam) {
    const articles = articlesParam.split(',').map(a => a.trim()).filter(Boolean)
    if (articles.length > 0) {
      where.article = { in: articles }
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { article: 'asc' }
  })

  const headers = [
    'article', 'name', 'price', 'oldPrice', 'categorySlug', 'description',
    'filter1', 'filter2', 'filter3', 'filter4', 'filter5',
    'stock', 'heightMax', 'baseMax', 'heightMin', 'baseMin',
    'scale', 'assembly', 'contents', 'artist',
    'gameSystem', 'type', 'faction', 'fileFormat', 'tags', 'images', 'featured'
  ]

  const rows = products.map(p => [
    p.article,
    `"${p.name.replace(/"/g, '""')}"`,
    p.price,
    p.oldPrice || '',
    p.category.slug,
    `"${p.description.replace(/"/g, '""')}"`,
    p.filter1 || '',
    p.filter2 || '',
    p.filter3 || '',
    p.filter4 || '',
    p.filter5 || '',
    p.stock?.toString() || '0',
    p.heightMax?.toString() || '',
    p.baseMax?.toString() || '',
    p.heightMin?.toString() || '',
    p.baseMin?.toString() || '',
    p.scale || '',
    p.assembly || '',
    p.contents || '',
    p.artist || '',
    p.gameSystem || '',
    p.type || '',
    p.faction || '',
    p.fileFormat || '',
    `"${p.tags.replace(/"/g, '""')}"`,
    `"${p.images.replace(/"/g, '""')}"`,
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