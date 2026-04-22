'use client'
import Link from 'next/link'
import { useState } from 'react'

interface CategoryCardProps {
  category: {
    name: string
    slug: string
    image?: string | null
  }
}

const getBannerByCategory = (name: string, slug: string): string | null => {
  const lowerName = name.toLowerCase()
  const lowerSlug = slug.toLowerCase()

  if (lowerName.includes('d&d') || lowerName.includes('dnd') || lowerSlug.includes('dnd')) {
    return '/dnd-banner.png'
  }
  if (lowerName.includes('trench') || lowerName.includes('crusade') || lowerSlug.includes('trench')) {
    return '/tc-banner.png'
  }
  if (lowerName.includes('универсальн') || lowerName.includes('universal') || lowerSlug.includes('universal')) {
    return '/uni-banner.png'
  }
  return null
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const [hasError, setHasError] = useState(false)

  let imageSrc = category.image && category.image.trim() !== '' ? category.image : null
  if (!imageSrc) {
    imageSrc = getBannerByCategory(category.name, category.slug)
  }

  if (!imageSrc) {
    return (
      <Link href={`/catalog?category=${category.slug}`} className="block w-full transition duration-300 hover:scale-105">
        <div className="relative w-full aspect-[900/400] rounded-xl overflow-hidden bg-darkbg">
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-semibold text-base">
            Заглушка
          </div>
        </div>
      </Link>
    )
  }

  if (hasError) {
    return (
      <Link href={`/catalog?category=${category.slug}`} className="block w-full transition duration-300 hover:scale-105">
        <div className="relative w-full aspect-[900/400] rounded-xl overflow-hidden bg-darkbg">
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-semibold text-base">
            Заглушка
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/catalog?category=${category.slug}`} className="block w-full transition duration-300 hover:scale-105">
      <div className="relative w-full aspect-[900/400] rounded-xl overflow-hidden bg-darkbg">
        <img
          src={imageSrc}
          alt={category.name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    </Link>
  )
}