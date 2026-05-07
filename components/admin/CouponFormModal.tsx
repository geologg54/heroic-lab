// components/admin/CouponFormModal.tsx
'use client'

import { useState, useEffect } from 'react'

interface CouponFormData {
  code: string
  type: string
  value: string
  minOrderAmount: string
  maxUses: string
  validFrom: string
  validUntil: string
  isActive: boolean
  stackable: boolean
}

interface CouponFormModalProps {
  isOpen: boolean
  editingCoupon?: any // если передан – режим редактирования
  onSave: (form: CouponFormData) => Promise<void>
  onClose: () => void
}

/**
 * Модальное окно создания/редактирования купона.
 */
export default function CouponFormModal({ isOpen, editingCoupon, onSave, onClose }: CouponFormModalProps) {
  const [form, setForm] = useState<CouponFormData>({
    code: '',
    type: 'percent',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    stackable: false,
  })
  const [saving, setSaving] = useState(false)

  // Заполнение формы при редактировании
  useEffect(() => {
    if (editingCoupon) {
      setForm({
        code: editingCoupon.code,
        type: editingCoupon.type,
        value: editingCoupon.value.toString(),
        minOrderAmount: editingCoupon.minOrderAmount?.toString() || '',
        maxUses: editingCoupon.maxUses?.toString() || '',
        validFrom: editingCoupon.validFrom ? editingCoupon.validFrom.slice(0, 10) : '',
        validUntil: editingCoupon.validUntil ? editingCoupon.validUntil.slice(0, 10) : '',
        isActive: editingCoupon.isActive,
        stackable: editingCoupon.stackable || false,
      })
    }
  }, [editingCoupon])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm({ ...form, [target.name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">
          {editingCoupon ? 'Редактировать купон' : 'Новый купон'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Код купона *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              placeholder="WELCOME10"
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Тип скидки *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            >
              <option value="percent">Процент</option>
              <option value="fixed">Фиксированная сумма</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">
              Значение * ({form.type === 'percent' ? '%' : '₽'})
            </label>
            <input
              type="number"
              name="value"
              min="1"
              max={form.type === 'percent' ? '100' : undefined}
              value={form.value}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Мин. сумма заказа (₽)</label>
            <input
              type="number"
              name="minOrderAmount"
              min="0"
              value={form.minOrderAmount}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Макс. использований</label>
            <input
              type="number"
              name="maxUses"
              min="1"
              value={form.maxUses}
              onChange={handleChange}
              placeholder="Без ограничений"
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Действует с</label>
            <input
              type="date"
              name="validFrom"
              value={form.validFrom}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Действует до</label>
            <input
              type="date"
              name="validUntil"
              value={form.validUntil}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                name="stackable"
                checked={form.stackable}
                onChange={handleChange}
                className="w-4 h-4 accent-accent"
              />
              Суммируется с другими скидками
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" disabled={saving} className="bg-accent px-4 py-2 rounded-lg text-white">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-700 px-4 py-2 rounded-lg text-white">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}