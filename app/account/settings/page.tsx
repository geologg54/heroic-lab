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

  // Состояния для профиля
  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Состояния для 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [showTwoFAModal, setShowTwoFAModal] = useState(false)
  const [twoFAStep, setTwoFAStep] = useState<'qr' | 'verify'>('qr')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [twoFASecret, setTwoFASecret] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFAError, setTwoFAError] = useState('')

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
    setTwoFAEnabled(session.user.twoFactorEnabled || false)
  }, [session, status, router])

  // Обновление профиля (без изменений)
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

  // === Функции для 2FA ===

  const enable2FA = async () => {
    setTwoFALoading(true)
    try {
      const res = await fetch('/api/user/2fa/enable', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setQrCode(data.qrCode)
        setTwoFASecret(data.secret)
        setTwoFAStep('qr')
        setShowTwoFAModal(true)
      } else {
        setError(data.error || 'Ошибка включения 2FA')
      }
    } catch {
      setError('Ошибка сети')
    } finally {
      setTwoFALoading(false)
    }
  }

  const verify2FA = async () => {
    if (!twoFACode || twoFACode.length !== 6) {
      setTwoFAError('Введите 6-значный код')
      return
    }
    setTwoFALoading(true)
    setTwoFAError('')
    try {
      const res = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: twoFACode })
      })
      const data = await res.json()
      if (res.ok) {
        await update() // обновляем сессию, чтобы получить twoFactorEnabled: true
        setTwoFAEnabled(true)
        setShowTwoFAModal(false)
        setSuccess('2FA успешно включена')
      } else {
        setTwoFAError(data.error || 'Неверный код')
      }
    } catch {
      setTwoFAError('Ошибка сети')
    } finally {
      setTwoFALoading(false)
    }
  }

  const disable2FA = async () => {
    const code = prompt('Введите код из приложения для подтверждения отключения 2FA')
    if (!code) return
    setTwoFALoading(true)
    try {
      const res = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code })
      })
      const data = await res.json()
      if (res.ok) {
        await update()
        setTwoFAEnabled(false)
        setSuccess('2FA отключена')
      } else {
        setError(data.error || 'Неверный код')
      }
    } catch {
      setError('Ошибка сети')
    } finally {
      setTwoFALoading(false)
    }
  }

  const closeTwoFAModal = () => {
    setShowTwoFAModal(false)
    setTwoFACode('')
    setTwoFAError('')
    setQrCode(null)
    setTwoFASecret('')
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
            {/* Поля профиля (без изменений) */}
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

            {/* Блок 2FA (только для админов) */}
            {session?.user?.role === 'admin' && (
              <div className="border-t border-borderLight pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Двухфакторная аутентификация</h3>
                {!twoFAEnabled ? (
                  <div>
                    <p className="text-gray-300 mb-4">
                      Двухфакторная аутентификация отключена. Включите для повышения безопасности.
                    </p>
                    <button
                      type="button"
                      onClick={enable2FA}
                      disabled={twoFALoading}
                      className="bg-accent px-4 py-2 rounded-lg text-white"
                    >
                      {twoFALoading ? 'Загрузка...' : 'Включить 2FA'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-green-400 mb-2">✅ Двухфакторная аутентификация включена</p>
                    <button
                      type="button"
                      onClick={disable2FA}
                      disabled={twoFALoading}
                      className="text-red-400 hover:text-red-300 underline"
                    >
                      Отключить 2FA
                    </button>
                  </div>
                )}
              </div>
            )}

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

      {/* Модальное окно для настройки 2FA */}
      {showTwoFAModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Настройка 2FA</h3>
            {twoFAStep === 'qr' && (
              <>
                <p className="text-gray-300 mb-2">
                  Отсканируйте QR-код в приложении-аутентификаторе (Google Authenticator, Authy).
                </p>
                <div className="flex justify-center mb-4">
                  {qrCode && <img src={qrCode} alt="QR Code" />}
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Или введите секретный ключ вручную: <br />
                  <code className="bg-black/30 p-1 rounded break-all">{twoFASecret}</code>
                </p>
                <button
                  onClick={() => setTwoFAStep('verify')}
                  className="w-full bg-accent py-2 rounded-lg text-white mb-2"
                >
                  Далее
                </button>
              </>
            )}
            {twoFAStep === 'verify' && (
              <>
                <p className="text-gray-300 mb-4">
                  Введите код из приложения для подтверждения:
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0,6))}
                  className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white text-center text-2xl mb-4"
                />
                {twoFAError && <p className="text-red-400 mb-2">{twoFAError}</p>}
                <button
                  onClick={verify2FA}
                  disabled={twoFALoading}
                  className="w-full bg-accent py-2 rounded-lg text-white mb-2"
                >
                  {twoFALoading ? 'Проверка...' : 'Подтвердить'}
                </button>
              </>
            )}
            <button
              onClick={closeTwoFAModal}
              className="w-full text-gray-400 hover:text-white py-2"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}