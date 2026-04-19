// app/api/admin/products/import/route.ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 МБ

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (error) {
    return error
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден в запросе' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Файл слишком большой. Максимум: ${MAX_FILE_SIZE / 1024 / 1024} МБ` }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Поддерживаются только файлы CSV' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '')
    if (lines.length < 2) {
      return NextResponse.json({ error: 'Файл должен содержать заголовок и хотя бы одну строку данных' }, { status: 400 })
    }

    // Определяем разделитель (запятая или точка с запятой)
    const firstLine = lines[0]
    const separator = firstLine.includes(';') ? ';' : ','
    
    const headers = firstLine.split(separator).map(h => h.trim())
    const expectedHeaders = [
      'article', 'name', 'price', 'oldPrice', 'categorySlug', 'description',
      'gameSystem', 'scale', 'type', 'faction', 'fileFormat', 'tags', 'images', 'featured'
    ]
    
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `В CSV отсутствуют обязательные колонки: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    const categories = await prisma.category.findMany()
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]))

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = parseCSVLine(line, separator)
      if (values.length !== headers.length) {
        results.errors.push(`Строка ${i + 1}: неверное количество колонок (ожидалось ${headers.length}, получено ${values.length})`)
        continue
      }

      const record: Record<string, string> = {}
      headers.forEach((header, index) => {
        record[header] = values[index]
      })

      // Валидация
      if (!record.article) {
        results.errors.push(`Строка ${i + 1}: отсутствует артикул`)
        continue
      }
      if (!record.name) {
        results.errors.push(`Строка ${i + 1}: отсутствует название`)
        continue
      }
      const price = parseInt(record.price)
      if (isNaN(price) || price < 0) {
        results.errors.push(`Строка ${i + 1}: некорректная цена "${record.price}"`)
        continue
      }

      const categorySlug = record.categorySlug?.trim()
      if (!categorySlug) {
        results.errors.push(`Строка ${i + 1}: не указан slug категории`)
        continue
      }
      const categoryId = categoryMap.get(categorySlug)
      if (!categoryId) {
        results.errors.push(`Строка ${i + 1}: категория со slug "${categorySlug}" не найдена`)
        continue
      }

      const productData = {
        article: record.article.trim(),
        name: record.name.trim(),
        price: price,
        oldPrice: record.oldPrice ? parseInt(record.oldPrice) || null : null,
        description: record.description?.trim() || '',
        images: record.images?.trim() || '', // ← обработка images
        categoryId: categoryId,
        gameSystem: record.gameSystem?.trim() || '',
        scale: record.scale?.trim() || '32mm',
        type: record.type?.trim() || 'unknown',
        faction: record.faction?.trim() || null,
        fileFormat: record.fileFormat?.trim() || 'STL',
        tags: record.tags?.trim() || '',
        featured: record.featured?.toLowerCase() === 'true',
      }

      try {
        const existing = await prisma.product.findUnique({ where: { article: productData.article } })
        if (existing) {
          await prisma.product.update({
            where: { article: productData.article },
            data: productData
          })
          results.updated++
        } else {
          await prisma.product.create({ data: productData })
          results.created++
        }
      } catch (err: any) {
        results.errors.push(`Строка ${i + 1}: ошибка сохранения – ${err.message}`)
      }
    }

    logger.info(`Импорт CSV завершён. Создано: ${results.created}, обновлено: ${results.updated}, ошибок: ${results.errors.length}`)
    
    return NextResponse.json({
      success: true,
      created: results.created,
      updated: results.updated,
      errors: results.errors
    })

  } catch (error) {
    logger.error('Ошибка импорта CSV', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера при импорте' }, { status: 500 })
  }
}

/**
 * Разбирает строку CSV с учётом кавычек и выбранного разделителя.
 */
function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === separator && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}