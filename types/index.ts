// types/index.ts

export interface CategoryRef {
  id: string
  name: string
  slug: string
}

export interface Product {
  article: string               // артикул, первичный ключ
  name: string
  price: number
  oldPrice?: number | null
  image: string                 // первое изображение (для карточек)
  images: string[]              // все изображения
  category: string | CategoryRef
  categorySlug: string
  categoryName?: string
  subcategory?: string | null
  description: string
  shortDesc?: string | null
  fileFormat: string
  scale: string
  type: string
  faction?: string | null
  gameSystem: string
  tags: string[]
  inStock: boolean
  popularity?: number | null
  featured?: boolean
  new?: boolean
  dateAdded?: Date | string | null
  createdAt?: Date | string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  products?: Product[]
}

export interface CartItem {
  product: Product
  quantity: number
}