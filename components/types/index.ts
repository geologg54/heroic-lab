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
  subcategory?: string
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
  popularity?: number
  featured?: boolean
  new?: boolean
  dateAdded?: string
  createdAt?: string
}

export interface Category {
  id?: string
  name: string
  slug: string
  icon?: string
  image?: string
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  products?: Product[]
}

export interface CartItem {
  product: Product
  quantity: number
}