// app/account/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    setForm(prev => ({
      ...prev,
      name: session.user.name || '',
      email: session.user.email || ''
    }))
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    const payload: any = {}
    if (form.name !== session?.user?.name) payload.name = form.name
    if (form.email !== session?.user?.email) payload.email = form.email
    if (form.newPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }

    if (Object.keys(payload).length === 0) {
      setSuccess('Нет изменений для сохранения')
      setLoading(false)
      return
    }

    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Ошибка обновления профиля')
    } else {
      setSuccess('Профиль успешно обновлён')
      await update()
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    }
    setLoading(false)
  }

  if (status === 'loading') {
    return <div className="text-white text-center py-20">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Настройки профиля</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 bg-cardbg p-6 rounded-xl border border-borderLight">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-white mb-2">Имя</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
                placeholder="Ваше имя"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
              />
            </div>

            <div className="border-t border-borderLight pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Сменить пароль</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Текущий пароль</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Новый пароль</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Подтвердите новый пароль</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-cyan-700 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}