'use client'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', address: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Имитация оплаты
    setSubmitted(true)
    clearCart()
    setTimeout(() => router.push('/account/orders'), 2000)
  }

  if (items.length === 0) return <div className="container mx-auto px-4 py-8 text-center">Корзина пуста</div>

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-green-400 text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white">Заказ оформлен!</h2>
        <p className="text-gray-300 mt-2">Ссылки на скачивание будут отправлены на ваш email.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Оформление заказа</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Имя" required className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input type="text" placeholder="Адрес (необязательно)" className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <div className="p-4 bg-cardbg rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Способ оплаты: Демо-режим</p>
            <p className="text-xs text-cyan-300">После нажатия кнопки заказ будет создан (без реального списания)</p>
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-cyan-700 py-3 rounded-lg font-bold text-white">Подтвердить заказ на {totalPrice} ₽</button>
        </form>
        <div className="bg-cardbg p-6 rounded-xl border border-borderLight">
          <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
          {items.map(item => <div key={item.product.id} className="flex justify-between py-2 border-b border-borderLight"><span>{item.product.name} x{item.quantity}</span><span>{item.product.price * item.quantity} ₽</span></div>)}
          <div className="flex justify-between font-bold text-lg mt-4"><span>Итого</span><span>{totalPrice} ₽</span></div>
        </div>
      </div>
    </div>
  )
}