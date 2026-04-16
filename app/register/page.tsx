'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Демо-регистрация: сохраняем пользователя и переходим в личный кабинет
    localStorage.setItem('user', JSON.stringify({ name, email }))
    router.push('/account')
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white"
          />
          <button type="submit" className="w-full border border-gray-400 hover:bg-accent hover:border-accent py-3 rounded-lg font-bold text-white">
            Зарегистрироваться
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link href="/login" className="hover:text-accent">Уже есть аккаунт? Войти</Link>
        </div>
      </div>
    </div>
  )
}