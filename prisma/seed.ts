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
  category: string
  gameSystem: string
  scale: string
  type: string
  faction?: string | null
  fileFormat: string
  tags: string
  featured?: boolean
  // popularity?: number // ❌ удаляем, так как поле убрано из схемы
  // 🆕 добавляем новые поля для импорта (если они есть в JSON)
  filter1?: string
  filter2?: string
  filter3?: string
  filter4?: string
  filter5?: string
  stock?: number
  heightMax?: number
  baseMax?: number
  heightMin?: number
  baseMin?: number
  assembly?: string
  contents?: string
  artist?: string
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'D&D': 'dnd',
  'Универсальная': 'universal',
  'Trench crusade': 'trench-crusade',
}

function slugify(text: string): string {
  if (CATEGORY_SLUG_MAP[text]) {
    return CATEGORY_SLUG_MAP[text]
  }
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
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

  const validProducts = products.filter(p => p.article && p.name && p.price)
  console.log(`📦 Найдено ${validProducts.length} валидных товаров`)

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const categoryMap = new Map<string, string>()

  for (const prod of validProducts) {
    const rawCategory = prod.category?.trim()
    if (!rawCategory) continue
    if (!categoryMap.has(rawCategory)) {
      const slug = slugify(rawCategory)
      categoryMap.set(rawCategory, slug)
    }
  }

  console.log(`📁 Создаём ${categoryMap.size} категорий`)
  for (const [rawName, slug] of categoryMap.entries()) {
    await prisma.category.create({
      data: {
        name: rawName,
        slug: slug,
        image: null,
        // 🆕 можно добавить значения по умолчанию для filter1Name... если нужно
      }
    })
    console.log(`➕ ${rawName} -> /category/${slug}`)
  }

  let imported = 0
  let skipped = 0

  for (const prod of validProducts) {
    try {
      const rawCategory = prod.category?.trim()
      if (!rawCategory) {
        console.warn(`⚠️ Товар ${prod.article} без категории, пропущен`)
        skipped++
        continue
      }

      const slug = categoryMap.get(rawCategory)
      if (!slug) {
        console.warn(`⚠️ Категория "${rawCategory}" не найдена в карте, товар ${prod.article} пропущен`)
        skipped++
        continue
      }

      const category = await prisma.category.findUnique({
        where: { slug }
      })
      if (!category) {
        console.warn(`⚠️ Категория со slug "${slug}" не найдена в БД, товар ${prod.article} пропущен`)
        skipped++
        continue
      }

      await prisma.product.create({
        data: {
          article: prod.article,
          name: prod.name,
          searchName: prod.name.toLowerCase(), // 🆕 обязательно для поиска
          price: prod.price,
          oldPrice: prod.oldPrice || null,
          description: prod.description || '',
          images: prod.images || '',
          categoryId: category.id,
          
          // 🆕 Новые универсальные фильтры
          filter1: prod.filter1 || null,
          filter2: prod.filter2 || null,
          filter3: prod.filter3 || null,
          filter4: prod.filter4 || null,
          filter5: prod.filter5 || null,
          
          // 🆕 Новые поля карточки товара
          stock: prod.stock ?? 0,
          heightMax: prod.heightMax || null,
          baseMax: prod.baseMax || null,
          heightMin: prod.heightMin || null,
          baseMin: prod.baseMin || null,
          assembly: prod.assembly || null,
          contents: prod.contents || null,
          artist: prod.artist || null,

          // Старые поля
          gameSystem: prod.gameSystem || '',
          scale: prod.scale || '32mm',
          type: prod.type || 'unknown',
          faction: prod.faction || null,
          fileFormat: prod.fileFormat || 'STL',
          tags: prod.tags || '',
          featured: prod.featured ?? false,
          // popularity: prod.popularity ?? 0, // ❌ удалено
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