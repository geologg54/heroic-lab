// components/checkout/OrderSummary.tsx
'use client'

import { useState } from 'react'

interface CartItem {
  cartItemId: string
  product: {
    name: string
    price: number
    oldPrice?: number | null
  }
  quantity: number
  options?: {
    materialName?: string
  }
}

interface OrderSummaryProps {
  items: CartItem[]
  totalPrice: number
  couponCode: string
  onCouponCodeChange: (code: string) => void
  onApplyCoupon: () => void
  onResetCoupon: () => void
  checkingCoupon: boolean
  couponError: string
  appliedCoupon: any
  couponDiscount: number
}

/**
 * Правая колонка с товарами и применением купона.
 */
export default function OrderSummary({
  items,
  totalPrice,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onResetCoupon,
  checkingCoupon,
  couponError,
  appliedCoupon,
  couponDiscount,
}: OrderSummaryProps) {
  const itemsTotal = items.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  )
  const itemsOldTotal = items.reduce(
    (sum: number, item: any) =>
      sum + (item.product.oldPrice || item.product.price) * item.quantity,
    0
  )
  const saleDiscount = itemsOldTotal - itemsTotal
  const finalTotal = totalPrice - couponDiscount
  const totalSavings = saleDiscount + couponDiscount

  return (
    <div className="bg-cardbg p-6 rounded-xl border border-borderLight">
      <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>

      {/* Список товаров */}
      {items.map((item: any) => (
        <div
          key={item.cartItemId}
          className="flex justify-between py-2 border-b border-borderLight"
        >
          <span>
            {item.product.name} ×{item.quantity}
            {item.options?.materialName && (
              <span className="block text-xs text-accent">
                Материал: {item.options.materialName}
              </span>
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
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            placeholder="Введите код"
            className="flex-1 p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            disabled={!!appliedCoupon}
          />
          {!appliedCoupon ? (
            <button
              type="button"
              onClick={onApplyCoupon}
              disabled={checkingCoupon || !couponCode.trim()}
              className="bg-accent px-4 py-2 rounded-lg text-white disabled:opacity-50"
            >
              {checkingCoupon ? '...' : 'Применить'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetCoupon}
              className="text-red-400 hover:text-red-300 px-4 py-2"
            >
              Сбросить
            </button>
          )}
        </div>
        {couponError && (
          <p
            className="text-red-400 text-sm mt-2"
            dangerouslySetInnerHTML={{
              __html: couponError
                .replace(
                  /<a href="([^"]+)">([^<]+)<\/a>/g,
                  '<a href="$1" class="underline text-accent hover:text-cyan-300" target="_blank">$2</a>'
                )
                .replace(/\n/g, '<br/>'),
            }}
          />
        )}
        {appliedCoupon && (
          <p className="text-green-400 text-sm mt-1">
            Купон {appliedCoupon.code} применён! Скидка: {couponDiscount} ₽
          </p>
        )}
      </div>

      {/* Итоги */}
      <div className="mt-4 pt-2 space-y-2">
        <div className="flex justify-between text-gray-300 text-sm">
          <span>Сумма товаров:</span>
          <span>{itemsTotal} ₽</span>
        </div>
        {saleDiscount > 0 && (
          <div className="flex justify-between text-green-400 text-sm">
            <span>Скидка по акции:</span>
            <span>-{saleDiscount} ₽</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-400 text-sm">
            <span>Скидка по купону:</span>
            <span>-{couponDiscount} ₽</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-borderLight">
          <span className="text-white font-bold text-lg">Итого к оплате:</span>
          <span className="text-white font-bold text-lg">{finalTotal} ₽</span>
        </div>
        {totalSavings > 0 && (
          <p className="text-green-400 text-sm text-right">
            Ваша экономия: {totalSavings} ₽
          </p>
        )}
      </div>
    </div>
  )
}