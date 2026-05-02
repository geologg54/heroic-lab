// components/common/BannerImage.tsx
'use client'
import { useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
}

export default function BannerImage({ src, alt, className }: Props) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    // Если картинка не загрузилась, просто ничего не показываем
    return null
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}