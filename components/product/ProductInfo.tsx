// components/product/ProductInfo.tsx
'use client'
import Image from 'next/image'
import { useState } from 'react'

interface ProductInfoProps {
  product: any
  showMinHeight: boolean
  defaultMaterialName?: string
}

export default function ProductInfo({ product, showMinHeight, defaultMaterialName }: ProductInfoProps) {
  const parseContents = () => {
    if (!product.contents) return null
    const parts = product.contents.split(',').map((v: string) => parseInt(v.trim(), 10))
    if (parts.length !== 4) return null
    const [цельные, требующиеСборки, декоративные, базы] = parts
    const items: string[] = []
    if (цельные > 0) items.push(`Цельных моделей – ${цельные}`)
    if (требующиеСборки > 0) items.push(`Моделей требующих сборки – ${требующиеСборки}`)
    if (декоративные > 0) items.push(`Декоративных элементов – ${декоративные}`)
    if (базы === 0) items.push('К этому товару базы/подставки не предусмотрены')
    else if (базы > 0) items.push(`Баз / Подставок – ${базы}`)
    return items
  }

  const contentsList = parseContents()
  const imageMax = `/images/products/${product.article}_2.webp`
  const imageMin = `/images/products/${product.article}_3.webp`

  const [imgMaxError, setImgMaxError] = useState(false)
  const [imgMinError, setImgMinError] = useState(false)

  return (
    <>
      <div className="mt-10 space-y-6 w-full">
        <h2 className="text-xl font-semibold text-white pb-3">Размеры</h2>
        {product.heightMax && (
          <div className="flex items-center">
            <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
              {!imgMaxError ? (
                <img
                  src={imageMax}
                  alt=""
                  className="object-cover w-full h-full brightness-0 invert"
                  onError={() => setImgMaxError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                  нет фото
                </div>
              )}
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
              {!imgMinError ? (
                <img
                  src={imageMin}
                  alt=""
                  className="object-cover w-full h-full brightness-0 invert"
                  onError={() => setImgMinError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                  нет фото
                </div>
              )}
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

      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Другие характеристики</h2>
        <ul className="space-y-3 text-gray-300 text-lg">
          <li><span className="font-medium text-white">Масштаб:</span> {product.scale}</li>
          <li><span className="font-medium text-white">Материал:</span> {defaultMaterialName || 'Не указан'}</li>
          <li className="flex items-center gap-2"><span className="font-medium text-white">Цвет:</span><Image src="/color-hd-grey.png" alt="Серый" width={20} height={20} className="inline-block" /></li>
          {product.assembly && <li><span className="font-medium text-white">Сборка модели:</span> {product.assembly}</li>}
          {product.artist && <li><span className="font-medium text-white">Художник:</span> {product.artist}</li>}
        </ul>
      </div>

      {contentsList && contentsList.length > 0 && (
        <div className="mt-10 w-full">
          <h2 className="text-xl font-semibold text-white pb-3 mb-4">Комплектация</h2>
          <ul className="list-disc list-inside text-gray-300 text-lg space-y-1">
            {contentsList.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Совет</h2>
        <p className="text-gray-300 text-lg">Рекомендуем приклеить к подставке, клей и краски не входят в комплект.</p>
      </div>

      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Описание</h2>
        <div className="prose prose-invert text-gray-300 max-w-none text-lg">
          {product.description.split('\n').map((para: string, idx: number) => <p key={idx}>{para}</p>)}
        </div>
      </div>
    </>
  )
}