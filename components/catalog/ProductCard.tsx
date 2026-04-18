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
    <div className="group relative bg-darkbg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col w-full h-full">
      <Link href={`/product/${product.article}`} className="block h-full flex flex-col">
        {/* Изображение — квадрат, фото вписывается без искажений */}
        <div className="relative aspect-square w-full bg-darkbg overflow-hidden">
          {hasImage ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 500px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-4 text-center bg-gray-800">
              Заглушка
            </div>
          )}
        </div>

        {/* Название товара — отступ сверху 16px, снизу 20px */}
        <div className="px-[10%] pt-5 pb-5">
          <h3 className="text-white font-semibold text-[26px] leading-tight tracking-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        {/* Блок с высотой и ценой — равные отступы между ними */}
        <div className="px-[10%] space-y-8">
          <div className="flex items-center gap-2">
            <img
              src="/sizeicon.png"
              alt="Высота модели"
              width={22}
              height={22}
              className="w-[22px] h-[22px]"
            />
            <span className="text-white font-normal text-[24px] leading-none">
              {heightMm} мм
            </span>
          </div>
          <div>
            <span className="text-white font-extrabold text-[35px] leading-none">
              {product.price} ₽
            </span>
          </div>
        </div>

        {/* Кнопка корзины — отступ сверху 20px, снизу 32px */}
        <div className="flex justify-end px-[10%] mt-5 mb-8">
          <button
            onClick={handleAddToCart}
            className="w-[100px] rounded-[20px] border border-white/50 bg-transparent hover:bg-white/10 transition-colors duration-200 flex items-center justify-center py-3"
          >
            <img
              src="/cardicon.png"
              alt="В корзину"
              className="w-auto h-auto max-w-[70%] max-h-[70%]"
            />
          </button>
        </div>
      </Link>
    </div>
  )
}