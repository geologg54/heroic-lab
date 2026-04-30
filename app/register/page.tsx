// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Ошибка регистрации')
      setLoading(false)
      return
    }

    // Показываем сообщение о подтверждении
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Регистрация</h1>

        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-300">
            <p className="font-semibold">На вашу почту отправлено письмо с подтверждением.</p>
            <p className="text-sm mt-1">Перейдите по ссылке в письме, чтобы активировать аккаунт.</p>
          </div>
        )}

        {!success && (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Имя (необязательно)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full bg-accent py-3 rounded-lg font-bold text-white disabled:opacity-50 hover:bg-white hover:text-darkbg hover:border-white border border-transparent transition-colors duration-300"
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-400">
              <Link href="/login" className="hover:text-accent">
                Уже есть аккаунт? Войти
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}