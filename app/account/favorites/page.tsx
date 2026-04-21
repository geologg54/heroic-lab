// app/account/favorites/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EmptyState } from '@/components/common/EmptyState'
import Link from 'next/link'
import type { Product } from '@/types'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      if (favorites.length === 0) {
        setFavoriteProducts([])
        setLoading(false)
        return
      }

      try {
        const articlesParam = favorites.join(',')
        const res = await fetch(`/api/products?articles=${encodeURIComponent(articlesParam)}&limit=100`)
        const data = await res.json()
        setFavoriteProducts(data.products || [])
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error)
        setFavoriteProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [favorites])

  if (loading) {
    return <div className="text-white text-center py-20">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Избранное</h1>
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-4 md:py-5">
          <EmptyState
            title="Нет избранных моделей"
            message="Добавьте товары в избранное, нажав на сердечко"
            image="/no-favor.png"
            imageClassName="w-64 h-64"
          />
          <div className="mt-6">
            <Link
              href="/catalog"
              className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              к товарам
            </Link>
          </div>
        </div>
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