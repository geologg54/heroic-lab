// app/account/favorites/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import { fetchAllProducts } from '@/lib/api'
import type { Product } from '@/types'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllProducts()
      .then(data => setAllProducts(data))
      .finally(() => setLoading(false))
  }, [])

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.article))

  if (loading) {
    return <div className="text-white text-center py-20">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Избранное</h1>
      {favoriteProducts.length === 0 ? (
        <EmptyState
          title="Нет избранных моделей"
          message="Добавьте товары в избранное, нажав на сердечко"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map(p => (
            <ProductCard key={p.article} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}