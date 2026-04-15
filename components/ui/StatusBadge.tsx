// components/ui/StatusBadge.tsx
export const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'product' | 'user' }) => {
  const variants: Record<string, string> = {
    paid: 'bg-green-900 text-green-300',
    pending: 'bg-yellow-900 text-yellow-300',
    active: 'bg-green-900 text-green-300',
    draft: 'bg-gray-700 text-gray-300',
    archived: 'bg-red-900 text-red-300',
  }
  const labels: Record<string, string> = {
    paid: 'Оплачен',
    pending: 'Ожидает',
    active: 'Активен',
    draft: 'Черновик',
    archived: 'Архив',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${variants[status] || 'bg-gray-700'}`}>{labels[status] || status}</span>
}