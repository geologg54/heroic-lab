// components/catalog/ProductCard.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FavoritesButton } from '@/components/common/FavoritesButton'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart()
  const isNew = product.dateAdded ? (new Date(product.dateAdded) > new Date(Date.now() - 30*24*60*60*1000)) : false
  const isPopular = product.popularity ? product.popularity > 80 : false
  const isFeatured = product.featured || false

  const hasImage = product.image && product.image.trim() !== ''

  return (
    <div className="premium-card group relative overflow-hidden">
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {isNew && <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Новинка</span>}
        {isPopular && <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">Популярное</span>}
        {isFeatured && <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">Рекомендуемое</span>}
      </div>
      <Link href={`/product/${product.article}`}>
        <div className="relative aspect-square bg-[#0a1220]">
          {hasImage ? (
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-contain p-3 group-hover:scale-105 transition" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-4 text-center bg-gray-800">
              Заглушка
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Link href={`/product/${product.article}`}>
            <h3 className="font-bold text-lg text-white hover:text-accent transition line-clamp-2">{product.name}</h3>
          </Link>
          <FavoritesButton productId={product.article} />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="chip">{product.gameSystem}</span>
          <span className="chip">{product.fileFormat.split(',')[0]}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-amber-400">{product.price} ₽</span>
            {product.oldPrice && <span className="ml-2 line-through text-gray-500 text-sm">{product.oldPrice} ₽</span>}
          </div>
          <button onClick={() => addToCart(product)} className="border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300">
          В корзину
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">📥 Цифровая загрузка</div>
      </div>
    </div>
  )
}