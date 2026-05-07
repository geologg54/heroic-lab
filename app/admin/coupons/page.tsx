// app/admin/coupons/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Send } from 'lucide-react'
import CouponFormModal from '@/components/admin/CouponFormModal'
import CouponSendModal from '@/components/admin/CouponSendModal'
import CouponsTable from '@/components/admin/CouponsTable'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Управление модалками
  const [showForm, setShowForm] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any | undefined>(undefined)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data)
    setLoading(false)
  }

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users?limit=1000')
    const data = await res.json()
    setUsers(data.users || [])
  }

  // Создание/редактирование
  const handleSave = async (form: any) => {
    const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons'
    const method = editingCoupon ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Ошибка сохранения')
    } else {
      fetchCoupons()
    }
  }

  // Удаление
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

  // Переключение активности
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    })
    fetchCoupons()
  }

  // Рассылка
  const handleSend = async (sendData: any) => {
    const res = await fetch('/api/admin/coupons/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sendData),
    })
    if (res.ok) {
      alert('Купоны отправлены!')
      fetchCoupons()
    } else {
      const err = await res.json()
      alert(err.error || 'Ошибка')
    }
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Скидочные купоны</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchUsers()
              setShowSend(true)
            }}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Send size={18} /> Рассылка
          </button>
          <button
            onClick={() => {
              setEditingCoupon(undefined)
              setShowForm(true)
            }}
            className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Plus size={18} /> Создать купон
          </button>
        </div>
      </div>

      {/* Модалки */}
      <CouponFormModal
        isOpen={showForm}
        editingCoupon={editingCoupon}
        onSave={async (form) => {
          await handleSave(form)
          setShowForm(false)
        }}
        onClose={() => setShowForm(false)}
      />

      <CouponSendModal
        isOpen={showSend}
        users={users}
        onSend={async (data) => {
          await handleSend(data)
          setShowSend(false)
        }}
        onClose={() => setShowSend(false)}
      />

      {/* Таблица */}
      <CouponsTable
        coupons={coupons}
        onEdit={(coupon) => {
          setEditingCoupon(coupon)
          setShowForm(true)
        }}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </div>
  )
}