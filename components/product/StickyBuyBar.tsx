// components/product/StickyBuyBar.tsx
'use client'
import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useMaterial } from '@/components/product/MaterialProvider'
import type { Product } from '@/types'

export const StickyBuyBar = ({ product, finalPrice }: { product: Product; finalPrice: number }) => {
  const [show, setShow] = useState(false)
  const { addToCart } = useCart()
  const { defaultMaterial, selectedMaterial } = useMaterial()

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  const handleStickyAdd = () => {
    const isMaterialChanged = defaultMaterial && selectedMaterial && selectedMaterial.id !== defaultMaterial.id
    const options = isMaterialChanged
      ? { materialName: selectedMaterial.name, materialId: selectedMaterial.id }
      : undefined
    addToCart(product, 1, options, finalPrice)
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-cardbg border-t border-borderLight p-4 flex justify-between items-center z-50 md:hidden">
      <div className="min-w-0 flex-1 mr-4">
        <div className="text-white font-bold text-sm truncate">{product.name}</div>
      </div>

      <button
        onClick={handleStickyAdd}
        className="flex items-center gap-2 bg-white text-darkbg font-bold text-lg px-5 py-2.5 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white active:bg-darkbg active:text-white focus:outline-none transition-colors duration-150 flex-shrink-0"
      >
        <ShoppingCart size={20} />
        <span className="flex flex-col items-start">
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-xs">{product.oldPrice} ₽</span>
          )}
          <span>{finalPrice} ₽</span>
        </span>
      </button>
    </div>
  )
}