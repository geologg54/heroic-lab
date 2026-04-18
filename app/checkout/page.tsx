// app/checkout/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    address: '',
    phone: '',
    comment: '',
    deliveryMethod: 'СДЭК', // по умолчанию
    paymentMethod: 'card',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Если пользователь не авторизован, перенаправляем на логин
  if (!session) {
    router.push('/login?redirect=/checkout')
    return null
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-white">
        Корзина пуста
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        address: form.address,
        phone: form.phone,
        comment: form.comment,
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Ошибка оформления заказа')
      setLoading(false)
      return
    }

    setSubmitted(true)
    clearCart()
    setTimeout(() => router.push('/account/orders'), 3000)
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-green-400 text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white">Заказ оформлен!</h2>
        <p className="text-gray-300 mt-2">
          Спасибо за заказ. Мы свяжемся с вами для подтверждения.
        </p>
        <p className="text-gray-400 text-sm mt-4">
          Перенаправление в историю заказов...
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Оформление заказа</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Адрес доставки *</label>
            <input
              type="text"
              placeholder="Город, улица, дом, квартира"
              required
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white mb-1">Телефон</label>
            <input
              type="tel"
              placeholder="+7 (999) 123-45-67"
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-white mb-1">Способ доставки</label>
            <select
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.deliveryMethod}
              onChange={e => setForm({ ...form, deliveryMethod: e.target.value })}
            >
              <option value="СДЭК">СДЭК</option>
              <option value="Почта России">Почта России</option>
              <option value="Самовывоз">Самовывоз</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Способ оплаты</label>
            <select
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="card">Картой онлайн (демо)</option>
              <option value="cash">Наличными при получении</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Комментарий к заказу</label>
            <textarea
              rows={3}
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent py-3 rounded-lg font-bold text-white disabled:opacity-50"
          >
            {loading ? 'Оформление...' : `Подтвердить заказ на ${totalPrice} ₽`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Нажимая кнопку, вы соглашаетесь с условиями доставки и оплаты.
          </p>
        </form>

        <div className="bg-cardbg p-6 rounded-xl border border-borderLight">
          <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
          {items.map(item => (
            <div key={item.product.article} className="flex justify-between py-2 border-b border-borderLight">
              <span>{item.product.name} x{item.quantity}</span>
              <span>{item.product.price * item.quantity} ₽</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Итого</span>
            <span>{totalPrice} ₽</span>
          </div>
        </div>
      </div>
    </div>
  )
}