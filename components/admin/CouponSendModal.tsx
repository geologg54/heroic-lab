// components/admin/CouponSendModal.tsx
'use client'

import { useState, useEffect } from 'react'

interface CouponSendModalProps {
  isOpen: boolean
  users: any[]   // список пользователей { id, email, name, ordersCount }
  onSend: (data: {
    code: string
    type: string
    value: string
    minOrderAmount: string
    maxUses: string
    validUntil: string
    stackable: boolean
    userIds: string[]
  }) => Promise<void>
  onClose: () => void
}

/**
 * Модальное окно рассылки купона выбранным пользователям.
 */
export default function CouponSendModal({ isOpen, users, onSend, onClose }: CouponSendModalProps) {
  const [form, setForm] = useState({
    code: '',
    type: 'percent',
    value: '',
    minOrderAmount: '',
    maxUses: '1',
    validUntil: '',
    stackable: false,
  })
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm({ ...form, [target.name]: value })
  }

  const toggleUser = (id: string) => {
    const newSet = new Set(selectedUserIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedUserIds(newSet)
  }

  const toggleAll = () => {
    if (selectedUserIds.size === users.length) setSelectedUserIds(new Set())
    else setSelectedUserIds(new Set(users.map((u) => u.id)))
  }

  const handleSend = async () => {
    if (!form.code || !form.type || !form.value) {
      alert('Заполните параметры купона')
      return
    }
    if (selectedUserIds.size === 0) {
      alert('Выберите хотя бы одного пользователя')
      return
    }
    setSending(true)
    try {
      await onSend({
        ...form,
        userIds: Array.from(selectedUserIds),
      })
      onClose()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-cardbg p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Рассылка купона</h2>

        {/* Форма параметров купона */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white mb-1">Код *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Тип *</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white">
              <option value="percent">%</option>
              <option value="fixed">Фикс ₽</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Значение *</label>
            <input type="number" name="value" value={form.value} onChange={handleChange} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
          </div>
          <div>
            <label className="block text-white mb-1">Мин. сумма</label>
            <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
          </div>
          <div>
            <label className="block text-white mb-1">Макс. использований</label>
            <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
          </div>
          <div>
            <label className="block text-white mb-1">Действует до</label>
            <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-white mt-6">
              <input type="checkbox" name="stackable" checked={form.stackable} onChange={handleChange} className="w-4 h-4 accent-accent" />
              Суммируется
            </label>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" checked={selectedUserIds.size === users.length && users.length > 0} onChange={toggleAll} />
            Выбрать всех
          </label>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
          {users.map((user: any) => (
            <label key={user.id} className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={selectedUserIds.has(user.id)} onChange={() => toggleUser(user.id)} />
              {user.email} ({user.name || '—'}) – заказов: {user.ordersCount}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={handleSend} disabled={sending} className="bg-accent px-4 py-2 rounded-lg text-white">
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
          <button onClick={onClose} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Отмена</button>
        </div>
      </div>
    </div>
  )
}