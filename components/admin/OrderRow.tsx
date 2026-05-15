// components/admin/OrderRow.tsx
'use client'
import { Eye } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  product: { name: string; article: string }
  quantity: number
  priceAtPurchase: number
}

interface Order {
  id: string
  orderNumber: number
  items: OrderItem[]
  total: number
  status: string
  deliveryMethod: string | null
  comment: string | null
  createdAt: string
}

interface OrderRowProps {
  order: Order
  isProcessing: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  checkedItems: Set<string>
  onToggleItem: (orderId: string, article: string) => void
  handleStatusChange: (orderId: string, newStatus: string) => void
}

function getDeliveryLabel(method: string | null): string {
  if (!method) return '—'
  const labels: Record<string, string> = {
    'СДЭК': 'СДЭК',
    'Почта России': 'Почта России',
    'Самовывоз': 'Самовывоз'
  }
  return labels[method] || method
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'processing': return 'text-yellow-400'
    case 'cancelled': return 'text-red-400'
    case 'in_delivery':
    case 'shipped':
    case 'delivered': return 'text-green-400'
    default: return 'text-white'
  }
}

export default function OrderRow({
  order,
  isProcessing,
  selected,
  onToggleSelect,
  checkedItems,
  onToggleItem,
  handleStatusChange,
}: OrderRowProps) {
  return (
    <tr className="border-t border-borderLight">
      <td className="p-3 w-10">
        {isProcessing ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(order.id)}
            className="w-4 h-4 accent-accent"
          />
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
      </td>
      <td className="p-3 font-mono">{order.orderNumber}</td>
      <td className="p-3 align-top">
        <div className="space-y-1 text-sm">
          {order.items.map((item: any) => {
            const name = item.product.name
            const qty = item.quantity
            const article = item.product.article
            const key = `${order.id}:${article}`
            const isChecked = checkedItems.has(key)

            return (
              <div key={item.id} className="flex items-center gap-1 leading-tight">
                <button
                  onClick={() => onToggleItem(order.id, article)}
                  className={`text-left hover:text-accent transition ${isChecked ? 'opacity-35' : ''}`}
                  title={isChecked ? 'Собрано' : 'Отметить как собранное'}
                >
                  {qty > 1 ? `${name} ×${qty}` : name}
                </button>
                {isChecked && (
                  <span className="text-green-500 text-lg leading-none ml-1" title="Отмечено">✓</span>
                )}
              </div>
            )
          })}
        </div>
      </td>
      <td className="p-3 text-center align-middle">
        {order.comment ? (
          <span title={order.comment} className="cursor-help text-lg">💬</span>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>
      <td className="p-3 align-middle">{order.total} ₽</td>
      <td className="p-3 align-middle">
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order.id, e.target.value)}
          className={`bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm ${getStatusColor(order.status)}`}
        >
          <option value="processing" className="text-yellow-400">В обработке</option>
          <option value="in_delivery" className="text-green-400">Передано в доставку</option>
          <option value="shipped" className="text-green-400">Отправлен</option>
          <option value="delivered" className="text-green-400">Доставлен</option>
          <option value="cancelled" className="text-red-400">Отменён</option>
        </select>
      </td>
      <td className="p-3 text-sm align-middle">{getDeliveryLabel(order.deliveryMethod)}</td>
      <td className="p-3 align-middle">{new Date(order.createdAt).toLocaleDateString()}</td>
      <td className="p-3 align-middle">
        <div className="flex justify-center">
          <Link
            href={`/admin/orders/${order.id}`}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Просмотреть заказ"
          >
            <Eye size={20} className="text-accent" />
          </Link>
        </div>
      </td>
    </tr>
  )
}