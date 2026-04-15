// components/catalog/CategoryCard.tsx
import Link from 'next/link'
import { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  count: number   // количество товаров передаётся извне
}

export const CategoryCard = ({ category, count }: CategoryCardProps) => (
  <Link href={`/category/${category.slug}`} className="premium-card block p-4 text-center hover:scale-105 transition">
    <div className="text-4xl mb-2">{category.icon}</div>
    <h3 className="text-white font-semibold">{category.name}</h3>
    <p className="text-xs text-gray-400">{count} моделей</p>
  </Link>
)