// app/reset-password/[token]/page.tsx
'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const params = useParams()
  const token = params?.token as string
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ошибка')
      } else {
        router.push('/login?reset=1')
      }
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Новый пароль</h1>
        {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Новый пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          />
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent py-3 rounded-lg font-bold text-white disabled:opacity-50 hover:bg-white hover:text-darkbg hover:border-white border border-transparent transition-colors duration-300"
          >
            {loading ? 'Сохранение...' : 'Сменить пароль'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link href="/login" className="hover:text-accent">Вернуться ко входу</Link>
        </div>
      </div>
    </div>
  )
}