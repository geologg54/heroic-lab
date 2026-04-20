// app/search/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import SearchBar from '@/components/common/SearchBar'
import type { Product } from '@/types'

// Компонент, который использует useSearchParams, должен быть обёрнут в Suspense
function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(query)}&limit=50`)
      .then(res => res.json())
      .then(data => {
        // API возвращает { products, total, ... }
        setProducts(data.products || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [query])

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Поиск моделей</h1>
        <SearchBar />
        <p className="text-gray-400 mt-4 text-center">Введите запрос в поле выше</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-white text-center py-20">Поиск...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">
        Результаты поиска: «{query}»
      </h1>
      <p className="text-gray-400 mb-6">Найдено {products.length} моделей</p>

      {products.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          message="Попробуйте изменить запрос или посмотрите все модели в каталоге"
          actionLink="/catalog"
          actionText="Перейти в каталог"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.article} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

// Основная страница с Suspense для корректной работы useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Загрузка...</div>}>
      <SearchResults />
    </Suspense>
  )
}