// components/common/EmptyState.tsx
import Link from 'next/link'
import Image from 'next/image'

interface EmptyStateProps {
  title: string
  message: string
  actionLink?: string
  actionText?: string
  image?: string // 🆕 путь к кастомной картинке
}

export const EmptyState = ({ title, message, actionLink, actionText, image }: EmptyStateProps) => (
  <div className="text-center py-20 px-4">
    {image ? (
      <Image 
        src={image} 
        alt={title} 
        width={200} 
        height={200} 
        className="mx-auto mb-4"
      />
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