// components/catalog/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart()
  const hasImage = product.image && product.image.trim() !== ''

  // Определяем, что показывать в качестве высоты
  const heightDisplay = product.heightMax ? `${product.heightMax} мм` : '—'

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
          <h3 className="text-white font-extrabold leading-tight tracking-tight line-clamp-2 text-[clamp(1rem,1.5vw,1.8rem)]">
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
                className="w-[clamp(18px,3vw,24px)] h-[clamp(18px,3vw,24px)]"
              />
              {/* Высота модели — теперь берется из heightMax и имеет тот же размер шрифта, что и цена */}
              <span className="text-white font-normal leading-none text-[clamp(1rem,1.5vw,1.75rem)]">
                {heightDisplay}
              </span>
            </div>
            <div>
              <span className="text-white font-normal leading-none text-[clamp(1rem,1.5vw,1.75rem)]">
                {product.price} ₽
              </span>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-[clamp(60px,12vw,90px)] rounded-[15px] border border-white/0 bg-transparent hover:bg-white transition-colors duration-200 flex items-center justify-center py-3 group/btn"
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