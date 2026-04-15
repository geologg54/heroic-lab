// components/product/StickyBuyBar.tsx
'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'

export const StickyBuyBar = ({ product }: { product: Product }) => {
  const [show, setShow] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 w-full bg-cardbg border-t border-borderLight p-4 flex justify-between items-center z-50 md:hidden">
      <div><div className="text-white font-bold">{product.name}</div><div className="text-amber-400">{product.price} ₽</div></div>
      <button onClick={() => addToCart(product)} className="bg-accent px-6 py-2 rounded-lg text-white font-semibold">В корзину</button>
    </div>
  )
}