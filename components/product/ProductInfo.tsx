// components/product/ProductInfo.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'

interface ProductInfoProps {
  product: Product
  showMinHeight: boolean
  defaultMaterialName?: string   // добавлено
}

/**
 * Блок с подробной информацией о товаре:
 * размеры, характеристики, описание, комплектация, совет.
 */
export default function ProductInfo({ product, showMinHeight, defaultMaterialName }: ProductInfoProps) {
  const [descExpanded, setDescExpanded] = useState(false)

  return (
    <>
      {/* Размеры */}
      <div className="mt-10 space-y-6 w-full">
        <h2 className="text-xl font-semibold text-white pb-3">Размеры</h2>
        {product.heightMax && (
          <div className="flex items-center">
            <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
              <Image src={product.images[0]} alt="" fill className="object-cover" />
            </div>
            <div className="relative w-[15%] aspect-square bg-transparent flex items-center justify-center flex-shrink-0">
              <Image src="/size-arrow.png" alt="" fill className="object-contain p-2" />
            </div>
            <span className="text-white text-sm md:text-lg leading-tight ml-2 pr-4">
              {showMinHeight
                ? `${product.heightMax} мм — самая высокая модель в наборе`
                : `${product.heightMax} мм — высота модели`}
            </span>
          </div>
        )}
        {showMinHeight && product.heightMin && (
          <div className="flex items-center">
            <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
              <Image src={product.images[1] || product.images[0]} alt="" fill className="object-cover" />
            </div>
            <div className="relative w-[15%] aspect-square bg-transparent flex items-center justify-center flex-shrink-0">
              <Image src="/size-arrow.png" alt="" fill className="object-contain p-2" />
            </div>
            <span className="text-white text-sm md:text-lg leading-tight ml-2 pr-4">
              {product.heightMin} мм — самая низкая модель в наборе
            </span>
          </div>
        )}
      </div>

      {/* Характеристики */}
      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Другие характеристики</h2>
        <ul className="space-y-3 text-gray-300 text-lg">
          <li><span className="font-medium text-white">Масштаб:</span> {product.scale}</li>
          <li>
            <span className="font-medium text-white">Материал:</span>{' '}
            {defaultMaterialName || 'Не указан'}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-medium text-white">Цвет:</span>
            <Image src="/color-hd-grey.png" alt="Серый" width={20} height={20} className="inline-block" />
          </li>
          {product.assembly && (
            <li><span className="font-medium text-white">Сборка модели:</span> {product.assembly}</li>
          )}
          {product.artist && (
            <li><span className="font-medium text-white">Художник:</span> {product.artist}</li>
          )}
        </ul>
      </div>

      {/* Описание */}
      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Описание</h2>
        <div className={`prose prose-invert text-gray-300 max-w-none text-lg ${!descExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
          {product.description.split('\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
        {product.description.split('\n').length > 4 && (
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="mt-2 text-accent hover:underline text-sm"
          >
            {descExpanded ? 'Свернуть' : 'Читать далее...'}
          </button>
        )}
      </div>

      {/* Комплектация */}
      {product.contents && (
        <div className="mt-10 w-full">
          <h2 className="text-xl font-semibold text-white pb-3 mb-4">Комплектация</h2>
          <ul className="list-disc list-inside text-gray-300 text-lg space-y-1">
            {product.contents.split(',').map((item, idx) => (
              <li key={idx}>{item.trim()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Совет</h2>
        <p className="text-gray-300 text-lg">
          Рекомендуем приклеить к подставке, клей и краски не входят в комплект.
        </p>
      </div>
    </>
  )
}