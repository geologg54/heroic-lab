// components/common/FavoritesButton.tsx
'use client'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

export const FavoritesButton = ({ productId }: { productId: string }) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const liked = isFavorite(productId)

  return (
    <button
      onClick={() => toggleFavorite(productId)}
      className="p-2 rounded-full active:bg-white/10 focus:outline-none transition"
    >
      <Heart size={22} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#9ca3af'} />
    </button>
  )
}