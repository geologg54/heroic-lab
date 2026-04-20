// app/admin/orders/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      if (!res.ok) throw new Error('Заказ не найден')
      const data = await res.json()
      setOrder(data)
      setStatus(data.status)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusSave = async () => {
    if (!order || status === order.status) {
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Ошибка сохранения')
      }
      // Обновляем локальный заказ
      setOrder({ ...order, status })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getStatusLabel = (s: string) => {
    const labels: Record<string, string> = {
      processing: 'В обработке',
      in_delivery: 'Передано в доставку',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён'
    }
    return labels[s] || s
  }

  if (loading) {
    return <div className="text-white p-6">Загрузка...</div>
  }

  if (error || !order) {
    return (
      <div className="text-white p-6">
        <p className="text-red-400">{error || 'Заказ не найден'}</p>
        <Link href="/admin/orders" className="text-accent hover:underline mt-4 inline-block">
          ← Вернуться к списку
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Заголовок и кнопка назад */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/orders"
          className="text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Заказ № {order.orderNumber}
        </h1>
        <div className="ml-auto text-sm text-gray-400">
          от {new Date(order.createdAt).toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Левая колонка */}
        <div className="space-y-6">
          {/* Статус */}
          <div className="bg-cardbg border border-borderLight rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Статус заказа</h2>
            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#0f2a42] border border-borderLight rounded px-3 py-2 text-white flex-1"
              >
                <option value="processing">В обработке</option>
                <option value="in_delivery">Передано в доставку</option>
                <option value="shipped">Отправлен</option>
                <option value="delivered">Доставлен</option>
                <option value="cancelled">Отменён</option>
              </select>
              <button
                onClick={handleStatusSave}
                disabled={saving || status === order.status}
                className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>

          {/* Информация о покупателе */}
          <div className="bg-cardbg border border-borderLight rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Покупатель</h2>
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-400">Имя:</span> {order.customerName}</p>
              <p><span className="text-gray-400">Email:</span> {order.customerEmail}</p>
              <p><span className="text-gray-400">Телефон:</span> {order.customerPhone}</p>
              {order.user && (
                <p className="text-sm text-gray-400">
                  Зарегистрированный пользователь (ID: {order.user.id.slice(-8)})
                </p>
              )}
            </div>
          </div>

          {/* Адрес доставки */}
          <div className="bg-cardbg border border-borderLight rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Доставка</h2>
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-400">Адрес:</span> {order.address}</p>
              <p><span className="text-gray-400">Способ доставки:</span> {order.deliveryMethod || '—'}</p>
              <p><span className="text-gray-400">Способ оплаты:</span> {order.paymentMethod || '—'}</p>
              {order.comment && (
                <p><span className="text-gray-400">Комментарий:</span> {order.comment}</p>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          {/* Состав заказа */}
          <div className="bg-cardbg border border-borderLight rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Состав заказа</h2>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start border-b border-borderLight pb-3 last:border-0">
                  <div className="flex-1">
                    <Link 
                      href={`/product/${item.product.article}`}
                      target="_blank"
                      className="text-white hover:text-accent"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-gray-400">
                      Артикул: {item.product.article}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">
                      {item.quantity} × {item.priceAtPurchase} ₽
                    </div>
                    <div className="text-gray-400">
                      = {item.quantity * item.priceAtPurchase} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Итоги */}
            <div className="mt-4 pt-4 border-t border-borderLight space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Сумма товаров:</span>
                <span>{order.total + (order.discount || 0)} ₽</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Скидка (купон {order.coupon?.code}):</span>
                  <span>-{order.discount} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Итого:</span>
                <span>{order.total} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}