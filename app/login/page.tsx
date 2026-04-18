// app/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Вызываем signIn из next-auth/react
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // не делаем автоматический редирект, управляем вручную
    })

    setLoading(false)

    if (result?.error) {
      setError('Неверный email или пароль')
    } else {
      router.push('/account')
      router.refresh() // обновляем данные сессии на клиенте
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Вход</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link href="/register" className="hover:text-accent">
            Нет аккаунта? Регистрация
          </Link>
          <br />
          <Link href="/forgot-password" className="hover:text-accent">
            Забыли пароль?
          </Link>
        </div>
      </div>
    </div>
  )
}