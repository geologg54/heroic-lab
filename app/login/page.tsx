// app/login/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const verifiedParam = searchParams.get('verified')
  const resetParam = searchParams.get('reset')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')   // <-- новое состояние
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  useEffect(() => {
    if (errorParam === 'verify') {
      setError('Email не подтверждён. Проверьте почту и перейдите по ссылке в письме.')
    } else if (errorParam === 'invalid_token') {
      setError('Неверная ссылка подтверждения.')
    } else if (errorParam === 'verify_error') {
      setError('Ошибка подтверждения email.')
    }

    if (verifiedParam === '1') {
      setSuccess('Email подтверждён! Теперь вы можете войти.')
    }
    if (resetParam === '1') {
      setSuccess('Пароль успешно изменён. Войдите с новым паролем.')
    }
  }, [errorParam, verifiedParam, resetParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      try {
        const checkRes = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
        const checkData = await checkRes.json()
        if (checkData.exists && !checkData.emailVerified) {
          setError('Email не подтверждён. Проверьте почту или запросите повторную отправку.')
          return
        }
      } catch (err) {
        console.error('Ошибка проверки email', err)
      }
      setError('Неверный email или пароль')
    } else {
      router.push('/account')
      router.refresh()
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Введите email')
      return
    }
    setResending(true)
    setResendStatus('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setResendStatus('Письмо отправлено повторно. Проверьте почту.')
      } else {
        const data = await res.json()
        setResendStatus(data.error || 'Ошибка')
      }
    } catch {
      setResendStatus('Ошибка сети')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="premium-card p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Вход</h1>
        {success && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
            {error}
            {error.includes('не подтверждён') && (
              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-2 text-sm underline hover:text-white disabled:opacity-50"
              >
                {resending ? 'Отправка...' : 'Отправить письмо ещё раз'}
              </button>
            )}
          </div>
        )}
        {resendStatus && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg">
            {resendStatus}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  )
}