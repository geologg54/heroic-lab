// components/common/EmptyState.tsx
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  message: string
  actionLink?: string
  actionText?: string
}

export const EmptyState = ({ title, message, actionLink, actionText }: EmptyStateProps) => (
  <div className="text-center py-20 px-4">
    <div className="text-6xl mb-4">🛒</div>
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-400 mb-6">{message}</p>
    {actionLink && actionText && <Link href={actionLink} className="text-accent hover:underline">{actionText}</Link>}
  </div>
)