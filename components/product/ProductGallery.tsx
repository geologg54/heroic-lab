// components/product/ProductGallery.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images }: { images: string[] }) {
  const [main, setMain] = useState(images[0])

  return (
    <div className="space-y-3">
      {/* Контейнер для главного изображения — адаптивная ширина */}
      <div className="relative w-full aspect-square bg-[#0a1220] rounded-xl overflow-hidden border border-borderLight">
        <Image
          src={main}
          alt="Главное фото"
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />
      </div>

      {/* Миниатюры — адаптивная сетка */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {images.map(img => (
          <button
            key={img}
            onClick={() => setMain(img)}
            className={`relative aspect-square rounded-md overflow-hidden border-2 ${
              main === img ? 'border-accent' : 'border-transparent'
            }`}
          >
            <Image
              src={img}
              alt=""
              fill
              className="object-contain bg-black/20"
              sizes="80px"
            />
          </button>
        ))}
      </div>
    </div>
  )
}