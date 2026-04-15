// types/index.ts
export interface Product {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  image: string
  images: string[]
  category: string
  categorySlug: string
  subcategory?: string          // добавлено
  description: string
  shortDesc: string
  fileFormat: string
  scale: string
  type: string                  // infantry, hero, monster, vehicle, terrain
  faction?: string
  gameSystem: string
  tags: string[]
  inStock: boolean
  downloadsCount: number
  isDigital: boolean
  popularity?: number           // добавлено (0-100)
  featured?: boolean            // добавлено
  new?: boolean                 // добавлено
  dateAdded?: string            // добавлено (YYYY-MM-DD)
}

export interface Category {
  name: string
  slug: string
  icon: string
  image?: string                // опционально
}

export interface CartItem {
  product: Product
  quantity: number
}