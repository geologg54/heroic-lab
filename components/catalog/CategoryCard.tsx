'use client'
import Link from 'next/link'
import { useState } from 'react'

interface CategoryCardProps {
  category: {
    name: string
    slug: string
    image?: string
  }
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const [imgError, setImgError] = useState(false)

  // Если картинка не указана в данных — сразу заглушка
  if (!category.image) {
    return (
      <Link href={`/category/${category.slug}`} className="block w-full transition duration-300 hover:scale-105">
        <div className="relative w-full aspect-[900/400] rounded-xl overflow-hidden bg-gray-800">
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-semibold text-base">
            Заглушка
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/category/${category.slug}`} className="block w-full transition duration-300 hover:scale-105">
      <div className="relative w-full aspect-[900/400] rounded-xl overflow-hidden bg-gray-800">
        {!imgError ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-semibold text-base">
            Заглушка
          </div>
        )}
      </div>
    </Link>
  )
}