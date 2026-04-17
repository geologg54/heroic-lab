// lib/utils.ts
import { Product } from '@/types'

/**
 * Безопасно получает имя категории товара
 */
export function getCategoryName(product: Product): string {
  if (typeof product.category === 'object' && product.category !== null) {
    return product.category.name
  }
  return product.category // предполагаем, что это строка
}

/**
 * Безопасно получает slug категории товара
 */
export function getCategorySlug(product: Product): string {
  if (typeof product.category === 'object' && product.category !== null) {
    return product.category.slug
  }
  return product.categorySlug // fallback
}