// app/checkout/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import SuccessMessage from '@/components/checkout/SuccessMessage'

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

  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  useEffect(() => {
    if (items.length === 0) router.push('/catalog')
  }, [items, router])

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        email: session.user.email || '',
        name: session.user.name || '',
      }))
    }
  }, [session])

  const autoComment = useMemo(() => {
    const lines: string[] = []
    items.forEach((item) => {
      if (item.options?.materialName) {
        lines.push(
          `"${item.product.article}" "${item.product.name}". Изменение материала на "${item.options.materialName}"`
        )
      }
    })
    return lines.join('\n')
  }, [items])

  useEffect(() => {
    if (autoComment) {
      setForm((prev) => ({ ...prev, comment: autoComment }))
    }
  }, [autoComment])

  const hasAutoComment = autoComment.length > 0

  if (status === 'loading' || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-white">
        Загрузка...
      </div>
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCheckingCoupon(true)
    setCouponError('')

    try {
      const couponItems = items.map((item: any) => ({
        article: item.product.article,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        oldPrice: item.product.oldPrice || null,
      }))

      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, items: couponItems }),
      })
      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error)
        setCouponDiscount(0)
        setAppliedCoupon(null)
      } else {
        setCouponDiscount(data.discount)
        setAppliedCoupon({ ...data.coupon, appliedItems: data.appliedItems })
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
    setTimeout(() => router.push(session?.user ? '/account/orders' : '/'), 3000)
  }

  if (submitted) return <SuccessMessage />

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Оформление заказа</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <CheckoutForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          hasAutoComment={hasAutoComment}
          finalTotal={totalPrice - couponDiscount}
        />
        <OrderSummary
          items={items}
          totalPrice={totalPrice}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
          onApplyCoupon={applyCoupon}
          onResetCoupon={() => {
            setCouponCode('')
            setCouponDiscount(0)
            setAppliedCoupon(null)
            setCouponError('')
          }}
          checkingCoupon={checkingCoupon}
          couponError={couponError}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
        />
      </div>
    </div>
  )
}