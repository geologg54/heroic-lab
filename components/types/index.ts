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
  description: string
  shortDesc: string
  fileFormat: string
  scale: string
  type: string
  faction?: string
  gameSystem: string
  tags: string[]
  inStock: boolean
  downloadsCount: number
  isDigital: boolean
}

export interface Category {
  name: string
  slug: string
  icon: string
  count: number
}

export interface CartItem {
  product: Product
  quantity: number
}