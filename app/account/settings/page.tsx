// app/account/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'
import ProfileForm from '@/components/account/ProfileForm'
import TwoFactorSection from '@/components/account/TwoFactorSection'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Состояние 2FA (берём из сессии)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  // Начальные данные профиля
  const [initialProfile, setInitialProfile] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    setInitialProfile({
      name: session.user.name || '',
      email: session.user.email || '',
      newPassword: '',
      confirmPassword: '',
    })
    setTwoFAEnabled(session.user.twoFactorEnabled || false)
  }, [session, status, router])

  // Обработчик отправки формы профиля
  const handleProfileSubmit = async (form: typeof initialProfile) => {
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
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Ошибка обновления профиля')
    } else {
      setSuccess('Профиль успешно обновлён')
      await update() // обновляем сессию
    }
    setLoading(false)
  }

  // Коллбэки для 2FA (передаются в TwoFactorSection)
  const handleEnable2FA = async () => {
    try {
      const res = await fetch('/api/user/2fa/enable', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        return { qrCode: data.qrCode, secret: data.secret }
      } else {
        return { error: data.error || 'Ошибка включения 2FA' }
      }
    } catch {
      return { error: 'Ошибка сети' }
    }
  }

  const handleVerify2FA = async (code: string) => {
    try {
      const res = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      })
      if (res.ok) {
        await update() // обновляем сессию
        setTwoFAEnabled(true)
        return { success: true }
      } else {
        const data = await res.json()
        return { error: data.error || 'Неверный код' }
      }
    } catch {
      return { error: 'Ошибка сети' }
    }
  }

  const handleDisable2FA = async (code: string) => {
    try {
      const res = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      })
      const data = await res.json()
      if (res.ok) {
        await update()
        setTwoFAEnabled(false)
        return { success: true }
      } else {
        return { error: data.error || 'Неверный код' }
      }
    } catch {
      return { error: 'Ошибка сети' }
    }
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

          {/* Форма профиля */}
          <ProfileForm
            initialData={initialProfile}
            onSubmit={handleProfileSubmit}
            loading={loading}
          />

          {/* 2FA (только для админов) */}
          {session?.user?.role === 'admin' && (
            <TwoFactorSection
              isEnabled={twoFAEnabled}
              onEnable={handleEnable2FA}
              onVerify={handleVerify2FA}
              onDisable={handleDisable2FA}
            />
          )}
        </div>
      </div>
    </div>
  )
}