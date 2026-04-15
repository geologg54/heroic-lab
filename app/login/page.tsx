'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Демо-логин
    localStorage.setItem('user', JSON.stringify({ email }))
    router.push('/account')
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Вход</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white" />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 rounded-lg bg-cardbg border border-borderLight text-white" />
          <button type="submit" className="w-full bg-accent py-3 rounded-lg font-bold text-white">Войти</button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400">
          <Link href="/register" className="hover:text-accent">Нет аккаунта? Регистрация</Link><br />
          <Link href="/forgot-password" className="hover:text-accent">Забыли пароль?</Link>
        </div>
      </div>
    </div>
  )
}