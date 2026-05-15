// components/checkout/CheckoutForm.tsx
'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface FormData {
  email: string
  name: string
  address: string
  phone: string
  comment: string
  deliveryMethod: string
  paymentMethod: string
}

interface CheckoutFormProps {
  form: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string
  hasAutoComment: boolean
  finalTotal: number
}

/**
 * Форма оформления заказа.
 * Если пользователь авторизован, показывает его данные и ссылку на настройки.
 * Если гость – поля email и имя становятся обязательными.
 */
export default function CheckoutForm({
  form,
  onChange,
  onSubmit,
  loading,
  error,
  hasAutoComment,
  finalTotal,
}: CheckoutFormProps) {
  const { data: session } = useSession()

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Для гостей показываем поля email и имя */}
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
              onChange={onChange}
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
              onChange={onChange}
            />
          </div>
        </>
      )}

      {/* Для авторизованных пользователей – блок с данными */}
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
            <Link href="/account/settings" className="text-accent hover:underline">
              настройках
            </Link>.
          </p>
        </div>
      )}

      {/* Адрес доставки (обязательно для всех) */}
      <div>
        <label className="block text-white mb-1">Адрес доставки *</label>
        <input
          type="text"
          name="address"
          placeholder="Город, улица, дом, квартира"
          required
          className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          value={form.address}
          onChange={onChange}
        />
      </div>

      {/* Телефон */}
      <div>
        <label className="block text-white mb-1">Телефон</label>
        <input
          type="tel"
          name="phone"
          placeholder="+7 (999) 123-45-67"
          className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          value={form.phone}
          onChange={onChange}
        />
      </div>

      {/* Способ доставки */}
      <div>
        <label className="block text-white mb-1">Способ доставки</label>
        <select
          name="deliveryMethod"
          className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          value={form.deliveryMethod}
          onChange={onChange}
        >
          <option value="СДЭК">СДЭК</option>
          <option value="Почта России">Почта России</option>
          <option value="Самовывоз">Самовывоз</option>
        </select>
      </div>

      {/* Способ оплаты */}
      <div>
        <label className="block text-white mb-1">Способ оплаты</label>
        <select
          name="paymentMethod"
          className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          value={form.paymentMethod}
          onChange={onChange}
        >
          <option value="card">Картой онлайн (демо)</option>
          <option value="cash">Наличными при получении</option>
        </select>
      </div>

      {/* Комментарий */}
      <div>
        <label className="block text-white mb-1">Комментарий к заказу</label>
        <textarea
          name="comment"
          rows={3}
          className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          value={form.comment}
          onChange={hasAutoComment ? undefined : onChange}
          readOnly={hasAutoComment}
        />
        {hasAutoComment && (
          <p className="text-xs text-gray-400 mt-1">
            Комментарий сформирован автоматически на основе выбранных опций
          </p>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Кнопка отправки */}
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
  )
}