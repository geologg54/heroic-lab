// app/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Демо-отправка
    setSubmitted(true)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Восстановление пароля</h1>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
            />
            <button type="submit" className="w-full bg-accent hover:bg-cyan-700 py-3 rounded-lg font-bold text-white">
              Отправить ссылку
            </button>
          </form>
        ) : (
          <p className="text-green-400">Ссылка для сброса пароля отправлена на {email}</p>
        )}
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link href="/login" className="hover:text-accent">Вернуться ко входу</Link>
        </div>
      </div>
    </div>
  )
}