// lib/api.ts
import type { Category, Product } from '@/types'

const API_BASE = '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка сервера' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

function parseStringToArray(value: any): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value.trim() === '' ? [] : value.split(',').map(s => s.trim())
  }
  return []
}

export async function fetchAllProducts(): Promise<Product[]> {
  // ВАЖНО: отключаем кэширование, чтобы всегда получать свежие данные из БД
  const res = await fetch(`${API_BASE}/products`, {
    cache: 'no-store',
    next: { revalidate: 0 }, // для уверенности
  })
  const products = await handleResponse<any[]>(res)

  return products.map(p => {
    const images = parseStringToArray(p.images)
    const tags = parseStringToArray(p.tags)

    let categorySlug = p.categorySlug
    if (typeof p.category === 'object' && p.category !== null) {
      categorySlug = p.category.slug
    }

    const image = images.length > 0 ? images[0] : ''

    return {
      ...p,
      images,
      tags,
      categorySlug,
      image,
    }
  })
}

export async function fetchAllCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories', {
    cache: 'no-store',
    next: { revalidate: 0 },
  })
  const data = await res.json()
  return data as Category[]
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${slug}`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  })
  const product = await handleResponse<any>(res)

  const images = parseStringToArray(product.images)
  const tags = parseStringToArray(product.tags)
  let categorySlug = product.categorySlug
  if (typeof product.category === 'object' && product.category !== null) {
    categorySlug = product.category.slug
  }

  const image = images.length > 0 ? images[0] : ''

  return {
    ...product,
    images,
    tags,
    categorySlug,
    image,
  }
}

export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  const all = await fetchAllProducts()
  return all.filter(p => {
    if (typeof p.category === 'object' && p.category !== null) {
      return p.category.slug === categorySlug
    }
    return p.categorySlug === categorySlug
  })
}