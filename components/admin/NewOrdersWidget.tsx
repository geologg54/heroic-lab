// components/admin/NewOrdersWidget.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

// Виджет показывает заказы со статусом "В обработке"
export const NewOrdersWidget = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Запрашиваем заказы со статусом processing, ограничиваем 5 штуками
    fetch('/api/admin/orders?status=processing&limit=5')
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Ошибка загрузки заказов:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-cardbg border border-borderLight rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Новые заказы</h2>
        <p className="text-gray-400">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Новые заказы</h2>
        <Link
          href="/admin/orders"
          className="text-accent text-sm hover:underline flex items-center gap-1"
        >
          <ShoppingBag size={16} /> Все заказы →
        </Link>
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-400 text-sm">Нет заказов в обработке</p>
      ) : (
        <>
          <div className="space-y-3">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">№ {order.orderNumber}</div>
                  <div className="text-gray-400 text-sm">
                    {order.customerName || order.guestEmail || 'Гость'}
                  </div>
                </div>
                <div className="text-white font-semibold">{order.total} ₽</div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/orders?status=processing"
            className="block w-full text-center bg-accent/20 hover:bg-accent/30 text-accent py-2 rounded-lg text-sm transition mt-4"
          >
            Обработать заказы
          </Link>
        </>
      )}
    </div>
  )
}