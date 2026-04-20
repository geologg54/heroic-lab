// app/auth/2fa/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function TwoFactorForm() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/2fa/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Ошибка')
      setLoading(false)
      return
    }

    // Обновляем сессию, добавляя twoFactorVerified: true
    await update({ twoFactorVerified: true })

    // Перенаправляем на исходную страницу
    router.push(callbackUrl)
  }

  if (!session) {
    return <div className="text-white text-center py-20">Загрузка...</div>
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Двухфакторная аутентификация</h1>
        <p className="text-gray-300 mb-6">
          Введите код из приложения-аутентификатора (Google Authenticator, Authy и т.п.)
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
            required
            className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white text-center text-2xl tracking-widest"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-accent py-3 rounded-lg font-bold text-white disabled:opacity-50 hover:bg-white hover:text-darkbg hover:border-white border border-transparent transition-colors duration-300"
            disabled={loading}
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Загрузка...</div>}>
      <TwoFactorForm />
    </Suspense>
  )
}