// app/api/admin/products/export/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  // 1. Проверяем, что запрос делает администратор
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  // 2. Получаем параметры запроса из URL
  const { searchParams } = new URL(request.url)
  // articlesParam может быть строкой вида "art1,art2,art3" (если передали)
  const articlesParam = searchParams.get('articles')

  // 3. Формируем условие для выборки товаров из базы данных
  const where: any = {}

  if (articlesParam) {
    // Если параметр передан, разбиваем его по запятой и убираем пробелы
    const articles = articlesParam
      .split(',')
      .map(a => a.trim())
      .filter(Boolean) // убираем пустые строки

    if (articles.length > 0) {
      // Указываем Prisma найти товары, у которых артикул входит в этот массив
      where.article = { in: articles }
    }
  }

  // 4. Запрашиваем товары из БД с учётом фильтра (или все, если фильтра нет)
  const products = await prisma.product.findMany({
    where, // если where пустой, вернутся все товары
    include: { category: true },
    orderBy: { article: 'asc' }
  })

  // 5. Формируем CSV (эта часть осталась без изменений)
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
    `"${p.images.replace(/"/g, '""')}"`,
    p.featured ? 'true' : 'false'
  ])

  const separator = ';'
  const csvContent = [
    headers.join(separator),
    ...rows.map(row => row.join(separator))
  ].join('\n')

  // Добавляем BOM для корректного отображения кириллицы в Excel
  const BOM = '\uFEFF'
  const finalContent = BOM + csvContent

  // 6. Возвращаем файл
  return new NextResponse(finalContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="products_export.csv"'
    }
  })
}