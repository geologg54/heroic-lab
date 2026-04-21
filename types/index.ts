// types/index.ts

export interface CategoryRef {
  id: string
  name: string
  slug: string
}

export interface Product {
  article: string
  name: string
  price: number
  oldPrice?: number | null
  image: string
  images: string[]
  category: string | CategoryRef
  categorySlug: string
  categoryName?: string
  subcategory?: string | null
  description: string
  shortDesc?: string | null
  
  // Новые универсальные фильтры
  filter1?: string | null
  filter2?: string | null
  filter3?: string | null
  filter4?: string | null
  filter5?: string | null
  
  // Новые поля карточки
  stock: number
  heightMax?: number | null
  baseMax?: number | null
  heightMin?: number | null
  baseMin?: number | null
  assembly?: string | null
  contents?: string | null
  artist?: string | null
  
  // Старые поля (сохраняем для совместимости)
  scale: string
  type: string
  faction?: string | null
  gameSystem: string
  fileFormat: string
  tags: string[]
  
  featured?: boolean
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
  
  // Названия динамических фильтров
  filter1Name?: string | null
  filter2Name?: string | null
  filter3Name?: string | null
  filter4Name?: string | null
  filter5Name?: string | null
}

export interface CartItem {
  product: Product
  quantity: number
}