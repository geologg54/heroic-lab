// components/admin/RecentOrders.tsx
import Link from 'next/link'

const recentOrders = [
  { id: 'ORD-001', customer: 'Иван Петров', total: 1498, status: 'paid', date: '2025-04-10' },
  { id: 'ORD-002', customer: 'Елена Смирнова', total: 899, status: 'processing', date: '2025-04-09' },
  { id: 'ORD-003', customer: 'Алексей Козлов', total: 2499, status: 'paid', date: '2025-04-09' },
  { id: 'ORD-004', customer: 'Мария Иванова', total: 599, status: 'shipped', date: '2025-04-08' },
  { id: 'ORD-005', customer: 'Дмитрий Соколов', total: 1249, status: 'paid', date: '2025-04-08' },
]

export const RecentOrders = () => {
  const getStatusBadge = (status: string) => {
    const statuses: Record<string, string> = {
      paid: 'bg-green-900 text-green-300',
      processing: 'bg-yellow-900 text-yellow-300',
      shipped: 'bg-blue-900 text-blue-300',
    }
    const labels: Record<string, string> = {
      paid: 'Оплачен',
      processing: 'В обработке',
      shipped: 'Отправлен',
    }
    return <span className={`px-2 py-1 rounded-full text-xs ${statuses[status] || 'bg-gray-700 text-gray-300'}`}>{labels[status] || status}</span>
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Последние заказы</h2>
        <Link href="/admin/orders" className="text-accent text-sm hover:underline">Все заказы →</Link>
      </div>
      <div className="space-y-3">
        {recentOrders.map(order => (
          <div key={order.id} className="flex justify-between items-center py-2 border-b border-borderLight last:border-0">
            <div>
              <div className="text-white font-medium">{order.id}</div>
              <div className="text-gray-400 text-sm">{order.customer}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">{order.total} ₽</div>
              <div className="text-gray-400 text-sm">{order.date}</div>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}