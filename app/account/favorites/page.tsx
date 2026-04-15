'use client'
import { useFavorites } from '@/hooks/useFavorites'
import { products } from '@/lib/data'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EmptyState } from '@/components/common/EmptyState'

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const favoriteProducts = products.filter(p => favorites.includes(p.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Избранное</h1>
      {favoriteProducts.length === 0 ? (
        <EmptyState title="Нет избранных моделей" message="Добавьте товары в избранное, нажав на сердечко" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}