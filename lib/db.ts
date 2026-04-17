// lib/db.ts
import { prisma } from './prisma'
import type { Category, Product } from '@/types'

// Вспомогательная функция для безопасного преобразования строки в массив
function parseStringToArray(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    include: { parent: true, children: true }
  })
  return categories as Category[]
}

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    include: { category: true }
  })

  return products.map(p => {
    const images = parseStringToArray(p.images)
    const tags = parseStringToArray(p.tags)

    return {
      article: p.article,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: images[0] || '',
      images,
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
      },
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      subcategory: null, // если нет в схеме, можно null
      description: p.description,
      shortDesc: null,   // можно заполнить из description при необходимости
      fileFormat: p.fileFormat,
      scale: p.scale,
      type: p.type,
      faction: p.faction,
      gameSystem: p.gameSystem,
      tags,
      inStock: p.inStock,
      downloadsCount: p.downloadsCount,
      isDigital: true,
      popularity: p.popularity,
      featured: p.featured,
      new: false,
      dateAdded: p.createdAt?.toISOString() || null,
      createdAt: p.createdAt?.toISOString() || null,
    } as Product
  })
}

export async function getProductByArticle(article: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { article },
    include: { category: true }
  })
  if (!product) return null

  const images = parseStringToArray(product.images)
  const tags = parseStringToArray(product.tags)

  return {
    article: product.article,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    image: images[0] || '',
    images,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    subcategory: null,
    description: product.description,
    shortDesc: null,
    fileFormat: product.fileFormat,
    scale: product.scale,
    type: product.type,
    faction: product.faction,
    gameSystem: product.gameSystem,
    tags,
    inStock: product.inStock,
    downloadsCount: product.downloadsCount,
    isDigital: true,
    popularity: product.popularity,
    featured: product.featured,
    new: false,
    dateAdded: product.createdAt?.toISOString() || null,
    createdAt: product.createdAt?.toISOString() || null,
  } as Product
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: { slug } },
    include: { category: true }
  })

  return products.map(p => {
    const images = parseStringToArray(p.images)
    const tags = parseStringToArray(p.tags)

    return {
      article: p.article,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: images[0] || '',
      images,
      category: {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
      },
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      subcategory: null,
      description: p.description,
      shortDesc: null,
      fileFormat: p.fileFormat,
      scale: p.scale,
      type: p.type,
      faction: p.faction,
      gameSystem: p.gameSystem,
      tags,
      inStock: p.inStock,
      downloadsCount: p.downloadsCount,
      isDigital: true,
      popularity: p.popularity,
      featured: p.featured,
      new: false,
      dateAdded: p.createdAt?.toISOString() || null,
      createdAt: p.createdAt?.toISOString() || null,
    } as Product
  })
}