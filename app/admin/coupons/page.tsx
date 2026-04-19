// app/admin/coupons/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '',
    type: 'percent',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId
      ? `/api/admin/coupons/${editingId}`
      : '/api/admin/coupons'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setShowForm(false)
      setEditingId(null)
      setForm({
        code: '',
        type: 'percent',
        value: '',
        minOrderAmount: '',
        maxUses: '',
        validFrom: '',
        validUntil: '',
        isActive: true,
      })
      fetchCoupons()
    } else {
      const error = await res.json()
      alert(error.error || 'Ошибка сохранения')
    }
  }

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : '',
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : '',
      isActive: coupon.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить купон?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchCoupons()
    } else {
      const error = await res.json()
      alert(error.error)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    })
    fetchCoupons()
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Скидочные купоны</h1>
        <button
          onClick={() => {
            setEditingId(null)
            setForm({
              code: '',
              type: 'percent',
              value: '',
              minOrderAmount: '',
              maxUses: '',
              validFrom: '',
              validUntil: '',
              isActive: true,
            })
            setShowForm(true)
          }}
          className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Plus size={18} /> Создать купон
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Редактировать купон' : 'Новый купон'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-1">Код купона *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="WELCOME10"
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Тип скидки *</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
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
                  min="1"
                  max={form.type === 'percent' ? '100' : undefined}
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })}
                  required
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Мин. сумма заказа (₽)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Макс. использований</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={e => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="Без ограничений"
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Действует с</label>
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={e => setForm({ ...form, validFrom: e.target.value })}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Действует до</label>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={e => setForm({ ...form, validUntil: e.target.value })}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="bg-accent px-4 py-2 rounded-lg text-white">
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-700 px-4 py-2 rounded-lg text-white"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">Код</th>
              <th className="p-3">Скидка</th>
              <th className="p-3">Использовано</th>
              <th className="p-3">Срок действия</th>
              <th className="p-3">Статус</th>
              <th className="p-3 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id} className="border-t border-borderLight">
                <td className="p-3 font-mono">{coupon.code}</td>
                <td className="p-3">
                  {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} ₽`}
                </td>
                <td className="p-3">
                  {coupon.usedCount}
                  {coupon.maxUses && ` / ${coupon.maxUses}`}
                </td>
                <td className="p-3">
                  {coupon.validUntil
                    ? `до ${new Date(coupon.validUntil).toLocaleDateString()}`
                    : 'Бессрочно'}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                    className={coupon.isActive ? 'text-green-400' : 'text-red-400'}
                  >
                    {coupon.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Редактировать"
                    >
                      <Edit size={20} className="text-accent" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={20} className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}