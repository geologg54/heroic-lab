// components/contact/ContactForm.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface ContactFormProps {
  initialMessage?: string
  onSubmit: (data: { message: string; email?: string; name?: string }) => Promise<void>
  loading: boolean
  error: string
}

/**
 * Форма создания нового обращения в поддержку.
 * Если пользователь авторизован, поля email/имя скрыты.
 * Гости могут оставить обращение без email.
 */
export default function ContactForm({ initialMessage = '', onSubmit, loading, error }: ContactFormProps) {
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState(initialMessage)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!message.trim()) {
      setLocalError('Введите сообщение')
      return
    }

    if (!session?.user && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Некорректный формат email')
      return
    }

    await onSubmit({
      message: message.trim(),
      email: email.trim() || undefined,
      name: name.trim() || undefined,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">Связь с поддержкой</h1>

      <div className="bg-cardbg border border-borderLight rounded-xl p-4 mb-6 text-sm text-gray-300">
        <p className="mb-2">Режим работы: ежедневно с 10:00 до 18:00 по московскому времени. Администратор старается отвечать в течение 15 минут.</p>
        <p>Мы принудительно не собираем персональные данные и контактную информацию. Вы можете остаться анонимным.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!session?.user && (
          <>
            <div>
              <label className="block text-white mb-1">
                Email <span className="text-gray-400 text-sm">(необязательно)</span>
              </label>
              <input
                type="email"
                className="w-full p-3 rounded bg-cardbg border border-borderLight text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ваш@email.ru"
              />
              <p className="text-xs text-gray-400 mt-1">
                Если не укажете email, наша переписка сохранится на этой странице, но вы не получите уведомление об ответе.
              </p>
            </div>
            <div>
              <label className="block text-white mb-1">Имя (необязательно)</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-cardbg border border-borderLight text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-white mb-1">Сообщение *</label>
          <textarea
            required
            className="w-full p-3 rounded bg-cardbg border border-borderLight text-white"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите ваш вопрос или проблему..."
          />
        </div>
        {(error || localError) && <div className="text-red-400">{error || localError}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}