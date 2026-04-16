// lib/adminData.ts
export interface Product {
  id: string
  title: string
  slug: string
  price: number
  category: string
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  createdAt: string
}

export const topProducts = [
  { id: '1', name: 'Кровавый ангел – Капитан Терминатор', sales: 45, revenue: 22455 },
  { id: '2', name: 'Йомены Новой Антиохии', sales: 38, revenue: 13262 },
  { id: '3', name: 'Древний красный дракон', sales: 22, revenue: 28578 },
  { id: '4', name: 'Проклятый легионер – Чумной рыцарь', sales: 19, revenue: 11381 },
  { id: '5', name: 'Техножрец Доминус', sales: 16, revenue: 7184 },
]

export const products: Product[] = [
  { id: '1', title: 'Кровавый ангел – Капитан Терминатор', slug: 'blood-angel-captain', price: 499, category: 'Космодесант', status: 'active', featured: true, createdAt: '2025-01-10' },
  { id: '2', title: 'Проклятый легионер – Чумной рыцарь', slug: 'plague-knight', price: 599, category: 'Легионы Хаоса', status: 'active', featured: false, createdAt: '2025-01-12' },
  // ... ещё 6 товаров
]

export const orders = [
  { id: 'ORD-001', customer: 'Иван Петров', total: 1498, status: 'paid', paymentStatus: 'paid', deliveryStatus: 'digital_sent', date: '2025-04-10', items: ['Кровавый ангел', 'Траншейный спецназ'] },
  // ... ещё 4 заказа
]

export const users = [
  { id: '1', name: 'Иван Петров', email: 'ivan@example.com', role: 'customer', status: 'active', ordersCount: 3 },
  // ...
]

export const banners = [
  { id: '1', title: 'Весенняя распродажа', image: '/banner1.jpg', active: true, link: '/catalog' },
]

export const categories = [
  { id: '1', name: 'Космодесант', slug: 'space-marines', parentId: null, description: 'Армии Империума', image: '/cat-space.jpg' },
  { id: '2', name: 'Trench Crusade', slug: 'trench-crusade', parentId: null, description: 'Траншейные войны', image: '/cat-trench.jpg' },
]

export const homepageSections = [
  { id: 'hero', type: 'hero', title: 'Главный герой', visible: true, order: 1 },
  { id: 'featured', type: 'products', title: 'Популярные модели', visible: true, order: 2 },
  { id: 'categories', type: 'categories', title: 'Категории', visible: true, order: 3 },
]

export const supportChats = [
  { id: 'chat1', customer: 'Алексей Смирнов', lastMessage: 'Когда будут новые модели?', unread: 2, status: 'open', updatedAt: '2025-04-14T10:30' },
  { id: 'chat2', customer: 'Мария Козлова', lastMessage: 'Спасибо за быструю доставку!', unread: 0, status: 'closed', updatedAt: '2025-04-13' },
]