// components/common/EmptyState.tsx
import Link from 'next/link'
import Image from 'next/image'

interface EmptyStateProps {
  title: string
  message: string
  actionLink?: string
  actionText?: string
  image?: string
  imageClassName?: string // 🆕 дополнительные классы для контейнера картинки
}

export const EmptyState = ({ title, message, actionLink, actionText, image, imageClassName }: EmptyStateProps) => (
  <div className="text-center py-20 px-4">
    {image ? (
      <div className={`relative mx-auto mb-4 ${imageClassName || 'w-32 h-32'}`}>
        <Image 
          src={image} 
          alt={title} 
          fill
          className="object-contain"
        />
      </div>
    ) : (
      <div className="text-6xl mb-4">🛒</div>
    )}
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-400 mb-6">{message}</p>
    {actionLink && actionText && (
      <Link href={actionLink} className="text-accent hover:underline">
        {actionText}
      </Link>
    )}
  </div>
)