'use client'
import { useSearchParams } from 'next/navigation'
import { products } from '@/lib/data'
import { ProductCard } from '@/components/catalog/ProductCard'
import SearchBar from '@/components/common/SearchBar'
import { EmptyState } from '@/components/common/EmptyState'

export default function SearchPage() {
  const query = useSearchParams().get('q') || ''
  const results = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-4">Поиск: «{query}»</h1>
      <div className="max-w-md mb-8"><SearchBar /></div>
      {results.length === 0 ? <EmptyState title="Ничего не найдено" message="Попробуйте изменить запрос" /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{results.map(p => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  )
}