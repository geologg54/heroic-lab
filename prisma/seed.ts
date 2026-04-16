// Импортируем PrismaClient — это наш главный инструмент для работы с базой данных
import { PrismaClient } from '@prisma/client'

// Импортируем моковые данные (категории и товары) из вашего файла lib/data.ts
// Оттуда мы возьмём всё, что нужно для заполнения базы
import { categories, products } from '../lib/data'

// Создаём экземпляр PrismaClient — через него будем выполнять все запросы к БД
const prisma = new PrismaClient()

// Главная функция, которая будет заполнять базу данных
async function main() {
  console.log('Начинаем заполнение базы данных...')

  // Очищаем таблицы в правильном порядке (сначала те, у которых есть внешние ключи, чтобы избежать ошибок)
  // OrderItem зависит от Order и Product, поэтому удаляем его первым
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.downloadToken.deleteMany()
  await prisma.product.deleteMany()   // Product зависит от Category, поэтому сначала удаляем продукты
  await prisma.category.deleteMany()  // Потом категории

  // ----- Заполняем таблицу Category -----
  for (const cat of categories) {
    // Для каждой категории из моков создаём запись в базе
    await prisma.category.create({
      data: {
        name: cat.name,           // название категории
        slug: cat.slug,           // уникальный идентификатор для URL (например, "space-marines")
        image: cat.image || null, // если картинка есть, используем её, иначе null
      },
    })
  }
  console.log('Категории добавлены')

  // ----- Заполняем таблицу Product -----
  for (const prod of products) {
    // Находим ID категории по её slug (чтобы связать товар с категорией)
    const category = await prisma.category.findUnique({
      where: { slug: prod.categorySlug },
    })

    // Если категория не найдена — пропускаем товар и выводим предупреждение
    if (!category) {
      console.warn(`Категория ${prod.categorySlug} не найдена, товар пропущен: ${prod.name}`)
      continue
    }

    // Создаём товар в базе
    await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        oldPrice: prod.oldPrice,
        images: prod.images.join(','),               // массив строк с путями к изображениям
        categoryId: category.id,           // связываем с найденной категорией по ID
        gameSystem: prod.gameSystem,
        scale: prod.scale,
        type: prod.type,
        faction: prod.faction,
        fileFormat: prod.fileFormat,
        tags: prod.tags.join(','),
        inStock: prod.inStock,
        downloadsCount: prod.downloadsCount,
        fileUrl: null,                     // пока не используем
        featured: prod.featured || false,
        popularity: prod.popularity || 0,
      },
    })
  }
  console.log('Товары добавлены')

  console.log('База данных успешно заполнена!')
}

// Вызываем главную функцию и обрабатываем возможные ошибки
main()
  .catch(e => {
    console.error(e)   // если ошибка — выводим её в консоль
    process.exit(1)    // завершаем процесс с кодом ошибки
  })
  .finally(async () => {
    // В любом случае закрываем соединение с базой данных
    await prisma.$disconnect()
  })