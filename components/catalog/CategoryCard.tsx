'use client'
import Link from 'next/link'
import { useState } from 'react'

interface CategoryCardProps {
  category: {
    name: string
    slug: string
    image?: string | null  // разрешаем null из БД
  }
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const [hasError, setHasError] = useState(false)

  const hasImage = category.image && category.image.trim() !== ''

  // Заглушка при отсутствии изображения
  if (!hasImage) {
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

  // Заглушка при ошибке загрузки
  if (hasError) {
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

  // Успешная загрузка изображения
  return (
    <Link href={`/category/${category.slug}`} className="block w-full transition duration-300 hover:scale-105">
      <div className="relative w-full aspect-[900/400] rounded-xl overflow-hidden bg-gray-800">
        <img
          src={category.image!}
          alt={category.name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    </Link>
  )
}