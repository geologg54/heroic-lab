// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ImportProduct {
  article: string
  name: string
  price: number
  oldPrice?: number | null
  description: string
  images: string
  category: string               // slug категории
  gameSystem: string
  scale: string
  type: string
  faction?: string | null
  fileFormat: string
  tags: string
  inStock?: boolean
  featured?: boolean
  popularity?: number
}

async function main() {
  console.log('🌱 Начинаем импорт товаров...')

  const filePath = path.join(__dirname, 'import.json')
  if (!fs.existsSync(filePath)) {
    console.error('❌ Файл import.json не найден в папке prisma')
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const products: ImportProduct[] = JSON.parse(fileContent)

  console.log(`📦 Найдено ${products.length} товаров`)

  // Очищаем таблицы
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.downloadToken.deleteMany()
  await prisma.product.deleteMany()
  // Категории НЕ удаляем, чтобы сохранить ранее созданные

  // Собираем уникальные slug категорий, исключая пустые
  const uniqueCategorySlugs = [...new Set(
    products
      .map(p => p.category)
      .filter(slug => slug && typeof slug === 'string' && slug.trim() !== '')
  )]

  console.log(`📁 Найдено ${uniqueCategorySlugs.length} уникальных категорий`)

  // Создаём недостающие категории
  for (const catSlug of uniqueCategorySlugs) {
    const existing = await prisma.category.findFirst({
      where: { slug: catSlug }
    })
    if (!existing) {
      // Генерируем имя из slug (заменяем дефисы на пробелы, первая буква заглавная)
      const name = catSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      await prisma.category.create({
        data: {
          name,
          slug: catSlug,
        }
      })
      console.log(`➕ Создана категория: ${name} (${catSlug})`)
    }
  }

  // Импорт товаров
  let imported = 0
  let skipped = 0

  for (const prod of products) {
    try {
      // Пропускаем товары без категории
      if (!prod.category || typeof prod.category !== 'string' || prod.category.trim() === '') {
        console.warn(`⚠️ Товар ${prod.article} пропущен: отсутствует категория`)
        skipped++
        continue
      }

      // Находим категорию по slug
      const category = await prisma.category.findFirst({
        where: { slug: prod.category }
      })

      if (!category) {
        console.warn(`⚠️ Категория "${prod.category}" не найдена, товар ${prod.article} пропущен`)
        skipped++
        continue
      }

      // Проверяем, нет ли уже товара с таким article
      const existingProduct = await prisma.product.findUnique({
        where: { article: prod.article }
      })
      if (existingProduct) {
        console.warn(`⚠️ Товар с артикулом ${prod.article} уже существует, пропущен`)
        skipped++
        continue
      }

      await prisma.product.create({
        data: {
          article: prod.article,
          name: prod.name,
          price: prod.price,
          oldPrice: prod.oldPrice || null,
          description: prod.description,
          images: prod.images,
          categoryId: category.id,
          gameSystem: prod.gameSystem,
          scale: prod.scale,
          type: prod.type,
          faction: prod.faction || null,
          fileFormat: prod.fileFormat,
          tags: prod.tags,
          inStock: prod.inStock ?? true,
          featured: prod.featured ?? false,
          popularity: prod.popularity ?? 0,
        }
      })
      imported++
    } catch (error) {
      console.error(`❌ Ошибка импорта товара ${prod.article}:`, error)
      skipped++
    }
  }

  console.log(`✅ Импорт завершён. Загружено ${imported} товаров, пропущено ${skipped}.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })