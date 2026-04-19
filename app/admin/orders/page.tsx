// app/admin/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import Link from 'next/link'

function getCustomerDisplay(order: any): string {
  if (order.user) {
    return order.user.name || order.user.email || 'Без имени'
  }
  return order.guestName || order.guestEmail || 'Гость'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    const url = statusFilter
      ? `/api/admin/orders?status=${statusFilter}`
      : '/api/admin/orders'
    const res = await fetch(url)
    const data = await res.json()
    setOrders(data.orders)
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus })
    })
    fetchOrders()
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Заказы</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-cardbg border border-borderLight rounded-lg px-4 py-2 text-white"
        >
          <option value="">Все статусы</option>
          <option value="processing">В обработке</option>
          <option value="shipped">Отправлен</option>
          <option value="delivered">Доставлен</option>
          <option value="cancelled">Отменён</option>
        </select>
      </div>

      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">№ заказа</th>
              <th className="p-3">Покупатель</th>
              <th className="p-3">Сумма</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Дата</th>
              <th className="p-3 text-center">Просмотр</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t border-borderLight">
                <td className="p-3 font-mono">{order.orderNumber}</td>
                <td className="p-3">{getCustomerDisplay(order)}</td>
                <td className="p-3">{order.total} ₽</td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="processing">В обработке</option>
                    <option value="shipped">Отправлен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                </td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}