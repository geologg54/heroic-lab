// lib/api.ts
// Базовый URL для API (при необходимости можно вынести в .env)
const API_BASE = '/api'

// Вспомогательная функция для обработки ответов
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Ошибка сервера' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Получить все товары (с преобразованием images и tags в массивы)
export async function fetchAllProducts() {
  const res = await fetch(`${API_BASE}/products`)
  const products = await handleResponse<any[]>(res)
  // Преобразуем строки в массивы
  return products.map(p => ({
    ...p,
    images: typeof p.images === 'string' ? p.images.split(',') : p.images,
    tags: typeof p.tags === 'string' ? p.tags.split(',') : p.tags
  }))
}

// Получить все категории
export async function fetchAllCategories() {
  const res = await fetch(`${API_BASE}/categories`)
  return handleResponse<any[]>(res)
}

// Получить один товар по slug
export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/products/${slug}`)
  const product = await handleResponse<any>(res)
  return {
    ...product,
    images: typeof product.images === 'string' ? product.images.split(',') : product.images,
    tags: typeof product.tags === 'string' ? product.tags.split(',') : product.tags
  }
}

// Получить товары по slug категории (фильтрация на клиенте или через API)
export async function fetchProductsByCategory(categorySlug: string) {
  const all = await fetchAllProducts()
  return all.filter(p => p.category?.slug === categorySlug)
}