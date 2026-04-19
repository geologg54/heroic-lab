// components/catalog/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart()
  const hasImage = product.image && product.image.trim() !== ''
  const heightMm = product.scale?.replace(/[^0-9]/g, '') || '?'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <div className="group relative bg-darkbg transition-all duration-300 hover:shadow-xl flex flex-col w-full">
      <Link href={`/product/${product.article}`} className="block flex flex-col">
        {/* Изображение — квадрат, не сжимается */}
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

        {/* Название товара */}
        <div className="pt-6 pb-6 pl-4 pr-4">
          <h3 className="text-white font-extrabold text-[24px] leading-tight tracking-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Блок с высотой, ценой и кнопкой */}
        <div className="flex justify-between items-center pl-5 pr-5 mt-2 mb-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <img
                src="/sizeicon.png"
                alt="Высота модели"
                width={22}
                height={22}
                className="w-[22px] h-[22px]"
              />
              <span className="text-white font-normal text-[22px] leading-none">
                {heightMm} мм
              </span>
            </div>
            <div>
              <span className="text-white font-normal text-[22px] leading-none">
                {product.price} ₽
              </span>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-[70px] rounded-[15px] border border-white/0 bg-transparent hover:bg-white transition-colors duration-200 flex items-center justify-center py-3 group/btn"
          >
            <img
              src="/cardicon.png"
              alt="В корзину"
              className="w-auto h-auto max-w-[70%] max-h-[70%] block group-hover/btn:hidden"
            />
            <img
              src="/cardicon-dark.png"
              alt="В корзину"
              className="w-auto h-auto max-w-[70%] max-h-[70%] hidden group-hover/btn:block"
            />
          </button>
        </div>
      </Link>
    </div>
  )
}