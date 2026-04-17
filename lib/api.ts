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
  const res = await fetch(`${API_BASE}/products`, {
    cache: 'no-store',
    next: { revalidate: 0 },
  })
  const products = await handleResponse<any[]>(res)

  return products.map(p => {
    const images = parseStringToArray(p.images)
    const tags = parseStringToArray(p.tags)

    let categorySlug = ''
    let categoryName = ''
    if (typeof p.category === 'object' && p.category !== null) {
      categorySlug = p.category.slug
      categoryName = p.category.name
    }

    const image = images.length > 0 ? images[0] : ''

    return {
      ...p,
      images,
      tags,
      categorySlug,
      categoryName,  // добавляем для удобства
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

// Получить товар по article
export async function fetchProductByArticle(article: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${article}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const product = await res.json()

    const images = parseStringToArray(product.images)
    const tags = parseStringToArray(product.tags)
    let categorySlug = ''
    let categoryName = ''
    if (typeof product.category === 'object' && product.category !== null) {
      categorySlug = product.category.slug
      categoryName = product.category.name
    }

    return {
      ...product,
      images,
      tags,
      categorySlug,
      categoryName,
      image: images.length > 0 ? images[0] : '',
    }
  } catch {
    return null
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