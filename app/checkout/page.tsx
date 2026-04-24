// app/checkout/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    name: '',
    address: '',
    phone: '',
    comment: '',
    deliveryMethod: 'СДЭК',
    paymentMethod: 'card',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Состояния для купона
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  // Перенаправляем, если корзина пуста
  useEffect(() => {
    if (items.length === 0) {
      router.push('/catalog')
    }
  }, [items, router])

  // Предзаполняем имя и email, если пользователь авторизован
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        email: session.user.email || '',
        name: session.user.name || '',
      }))
    }
  }, [session])

  // Автоматический комментарий на основе изменённых материалов
  const autoComment = useMemo(() => {
    const lines: string[] = []
    items.forEach(item => {
      if (item.options?.materialName) {
        lines.push(
          `"${item.product.article}" "${item.product.name}". Изменение материала на "${item.options.materialName}"`
        )
      }
      // В будущем сюда же можно добавить другие опции (масштаб и т.д.)
    })
    return lines.join('\n')
  }, [items])

  // Обновляем поле комментария, если есть автоматический комментарий
  useEffect(() => {
    if (autoComment) {
      setForm(prev => ({ ...prev, comment: autoComment }))
    }
  }, [autoComment])

  const hasAutoComment = autoComment.length > 0

  // Пока загружается сессия или корзина пуста, показываем заглушку
  if (status === 'loading' || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-white">
        Загрузка...
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Применение купона
  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCheckingCoupon(true)
    setCouponError('')

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: totalPrice }),
      })
      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error)
        setCouponDiscount(0)
        setAppliedCoupon(null)
      } else {
        setCouponDiscount(data.discount)
        setAppliedCoupon(data.coupon)
      }
    } catch {
      setCouponError('Ошибка проверки купона')
    } finally {
      setCheckingCoupon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Клиентская валидация
    if (!form.address.trim()) {
      setError('Укажите адрес доставки')
      setLoading(false)
      return
    }

    if (!session?.user && !form.email.trim()) {
      setError('Укажите email для связи')
      setLoading(false)
      return
    }

    const payload = {
      items,
      address: form.address,
      phone: form.phone,
      comment: form.comment,
      deliveryMethod: form.deliveryMethod,
      paymentMethod: form.paymentMethod,
      email: form.email || undefined,
      name: form.name || undefined,
      couponId: appliedCoupon?.id,
      discount: couponDiscount,
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Ошибка оформления заказа')
      setLoading(false)
      return
    }

    setSubmitted(true)
    clearCart()
    setTimeout(() => {
      router.push(session?.user ? '/account/orders' : '/')
    }, 3000)
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
          Перенаправление...
        </p>
      </div>
    )
  }

  const finalTotal = totalPrice - couponDiscount

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Оформление заказа</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поля для гостей */}
          {!session?.user && (
            <>
              <div>
                <label className="block text-white mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.ru"
                  required
                  className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-white mb-1">Имя</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Иван Иванов"
                  className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Данные авторизованного пользователя */}
          {session?.user && (
            <div className="p-4 bg-cardbg rounded-lg border border-borderLight">
              <p className="text-white">
                <span className="text-gray-400">Email:</span> {session.user.email}
              </p>
              {session.user.name && (
                <p className="text-white mt-1">
                  <span className="text-gray-400">Имя:</span> {session.user.name}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                Данные взяты из вашего профиля. Изменить можно в{' '}
                <a href="/account/settings" className="text-accent hover:underline">
                  настройках
                </a>.
              </p>
            </div>
          )}

          <div>
            <label className="block text-white mb-1">Адрес доставки *</label>
            <input
              type="text"
              name="address"
              placeholder="Город, улица, дом, квартира"
              required
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-white mb-1">Телефон</label>
            <input
              type="tel"
              name="phone"
              placeholder="+7 (999) 123-45-67"
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-white mb-1">Способ доставки</label>
            <select
              name="deliveryMethod"
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.deliveryMethod}
              onChange={handleChange}
            >
              <option value="СДЭК">СДЭК</option>
              <option value="Почта России">Почта России</option>
              <option value="Самовывоз">Самовывоз</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Способ оплаты</label>
            <select
              name="paymentMethod"
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.paymentMethod}
              onChange={handleChange}
            >
              <option value="card">Картой онлайн (демо)</option>
              <option value="cash">Наличными при получении</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Комментарий к заказу</label>
            <textarea
              name="comment"
              rows={3}
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
              value={form.comment}
              onChange={hasAutoComment ? undefined : handleChange}
              readOnly={hasAutoComment}
            />
            {hasAutoComment && (
              <p className="text-xs text-gray-400 mt-1">
                Комментарий сформирован автоматически на основе выбранных опций
              </p>
            )}
          </div>
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent py-3 rounded-lg font-bold text-white disabled:opacity-50 hover:bg-white hover:text-darkbg hover:border-white border border-transparent transition-colors duration-300"
          >
            {loading ? 'Оформление...' : `Подтвердить заказ на ${finalTotal} ₽`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Нажимая кнопку, вы соглашаетесь с условиями доставки и оплаты.
          </p>
        </form>

        {/* Состав заказа */}
        <div className="bg-cardbg p-6 rounded-xl border border-borderLight">
          <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
          {items.map(item => (
            <div key={`${item.product.article}_${JSON.stringify(item.options)}`} className="flex justify-between py-2 border-b border-borderLight">
              <span>
                {item.product.name} x{item.quantity}
                {item.options?.materialName && (
                  <span className="block text-xs text-accent">Материал: {item.options.materialName}</span>
                )}
              </span>
              <span>{item.product.price * item.quantity} ₽</span>
            </div>
          ))}

          {/* Блок купона */}
          <div className="mt-4 pt-4 border-t border-borderLight">
            <label className="block text-white mb-2">Промокод</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Введите код"
                className="flex-1 p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={checkingCoupon || !couponCode.trim()}
                  className="bg-accent px-4 py-2 rounded-lg text-white disabled:opacity-50"
                >
                  {checkingCoupon ? '...' : 'Применить'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCouponCode('')
                    setCouponDiscount(0)
                    setAppliedCoupon(null)
                    setCouponError('')
                  }}
                  className="text-red-400 hover:text-red-300 px-4 py-2"
                >
                  Сбросить
                </button>
              )}
            </div>
            {couponError && <p className="text-red-400 text-sm mt-1">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-green-400 text-sm mt-1">
                Купон {appliedCoupon.code} применён! Скидка: {couponDiscount} ₽
              </p>
            )}
          </div>

          {/* Итоговая сумма */}
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-borderLight">
            <span className="text-white font-bold">Скидка:</span>
            <span className="text-green-400 font-bold">-{couponDiscount} ₽</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-white font-bold text-lg">Итого к оплате:</span>
            <span className="text-white font-bold text-lg">{finalTotal} ₽</span>
          </div>
        </div>
      </div>
    </div>
  )
}