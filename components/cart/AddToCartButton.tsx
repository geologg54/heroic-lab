// components/cart/AddToCartButton.tsx
'use client'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  return (
    <button onClick={() => addToCart(product)} className="flex items-center gap-2 bg-accent hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition">
      <ShoppingCart size={20} /> Добавить в корзину
    </button>
  )
}