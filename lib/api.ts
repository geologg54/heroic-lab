// lib/api.ts
import type { Category, Product } from '@/types'

// Функция для получения базового URL в зависимости от окружения
const getBaseUrl = () => {
  // На клиенте (в браузере) можно использовать относительные пути
  if (typeof window !== 'undefined') {
    return ''
  }
  // На сервере – абсолютный URL из переменной окружения
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Fallback для локальной разработки
  return 'http://localhost:3000'
}

const API_BASE = `${getBaseUrl()}/api`

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
  const url = `${API_BASE}/products?limit=1000`
  const res = await fetch(url, {
    cache: 'no-store',
    next: { revalidate: 0 },
  })
  const data = await handleResponse<any>(res)

  const productsArray = Array.isArray(data) ? data : data.products

  if (!Array.isArray(productsArray)) {
    console.error('fetchAllProducts: expected array, got', productsArray)
    return []
  }

  return productsArray.map((p: any) => {
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
      categoryName,
      image,
    }
  })
}

export async function fetchAllCategories(): Promise<Category[]> {
  const url = `${API_BASE}/categories`
  const res = await fetch(url, {
    cache: 'no-store',
    next: { revalidate: 0 },
  })
  const data = await res.json()
  return data as Category[]
}

export async function fetchProductByArticle(article: string): Promise<Product | null> {
  try {
    const url = `${API_BASE}/products/${article}`
    const res = await fetch(url, {
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