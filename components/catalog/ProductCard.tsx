// components/catalog/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart()
  const hasImage = product.image && product.image.trim() !== ''

  const heightDisplay = product.heightMax ? `${product.heightMax} мм` : '—'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <div className="group relative bg-darkbg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col w-full h-full">
      <Link href={`/product/${product.article}`} className="flex flex-col h-full">
        <div className="relative aspect-square w-full bg-darkbg overflow-hidden flex-shrink-0">
          {hasImage ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 500px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-4 text-center bg-gray-800">
              Заглушка
            </div>
          )}
        </div>

        {/* Добавлен mt-2 — отступ между картинкой и названием */}
        <div className="flex-1 flex flex-col pb-3 mt-2">
          <div className="px-4 pt-4 pb-2 h-14 flex items-end">
            <h3 className="text-white font-extrabold leading-tight tracking-tight line-clamp-2 text-[clamp(0.85rem,1.4vw,1.65rem)]">
              {product.name}
            </h3>
          </div>

          <div className="flex justify-between items-end px-4 pb-4 mt-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <img
                  src="/sizeicon.png"
                  alt="Высота модели"
                  className="w-[clamp(18px,3vw,24px)] h-[clamp(18px,3vw,24px)]"
                />
                <span className="text-white font-normal leading-none text-[clamp(0.9rem,1.2vw,1.5rem)]">
                  {heightDisplay}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-white font-normal leading-none whitespace-nowrap text-[clamp(0.9rem,1.2vw,1.5rem)]">
                  {product.price} ₽
                </span>
                {product.oldPrice && (
                  <span className="text-gray-500 line-through text-xs whitespace-nowrap">
                    {product.oldPrice} ₽
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-[clamp(60px,12vw,90px)] rounded-[15px] border border-white/0 bg-transparent hover:bg-white active:bg-white/80 focus:outline-none transition-colors duration-150 flex items-center justify-center py-3 group/btn"
            >
              <img
                src="/cardicon.png"
                alt="В корзину"
                className="w-auto h-auto max-w-[70%] max-h-[70%] block group-hover/btn:hidden group-active/btn:hidden"
              />
              <img
                src="/cardicon-dark.png"
                alt="В корзину"
                className="w-auto h-auto max-w-[70%] max-h-[70%] hidden group-hover/btn:block group-active/btn:block"
              />
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}