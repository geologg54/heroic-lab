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
      subcategory: null,
      description: p.description,
      shortDesc: null,
      filter1: p.filter1,
      filter2: p.filter2,
      filter3: p.filter3,
      filter4: p.filter4,
      filter5: p.filter5,
      stock: p.stock,
      heightMax: p.heightMax,
      baseMax: p.baseMax,
      heightMin: p.heightMin,
      baseMin: p.baseMin,
      assembly: p.assembly,
      contents: p.contents,
      artist: p.artist,
      scale: p.scale,
      tags,
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
    filter1: product.filter1,
    filter2: product.filter2,
    filter3: product.filter3,
    filter4: product.filter4,
    filter5: product.filter5,
    stock: product.stock,
    heightMax: product.heightMax,
    baseMax: product.baseMax,
    heightMin: product.heightMin,
    baseMin: product.baseMin,
    assembly: product.assembly,
    contents: product.contents,
    artist: product.artist,
    scale: product.scale,
    tags,
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
      filter1: p.filter1,
      filter2: p.filter2,
      filter3: p.filter3,
      filter4: p.filter4,
      filter5: p.filter5,
      stock: p.stock,
      heightMax: p.heightMax,
      baseMax: p.baseMax,
      heightMin: p.heightMin,
      baseMin: p.baseMin,
      assembly: p.assembly,
      contents: p.contents,
      artist: p.artist,
      scale: p.scale,
      tags,
      createdAt: p.createdAt?.toISOString() || null,
    } as Product
  })
}