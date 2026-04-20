// app/sitemap.ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Получаем все товары и категории из БД
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: { article: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({
      select: { slug: true }
    })
  ])

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Страницы товаров
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.article}`,
    lastModified: product.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Страницы категорий
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(), // категории обновляются редко, можно поставить текущую дату
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}