// components/contact/TicketView.tsx
'use client'

import { useState } from 'react'

interface Message {
  id: string
  senderType: 'customer' | 'admin' | 'system'
  message: string
  admin?: { name?: string | null } | null
}

interface Ticket {
  id: string
  ticketNumber: string
  status: string
  messages: Message[]
  customerEmail?: string | null
}

interface TicketViewProps {
  ticket: Ticket
  onSendMessage: (message: string) => Promise<void>
  loading: boolean
  isGuest: boolean
}

/**
 * Просмотр существующего тикета: переписка и поле для нового сообщения.
 */
export default function TicketView({ ticket, onSendMessage, loading, isGuest }: TicketViewProps) {
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    if (!message.trim()) return
    await onSendMessage(message)
    setMessage('')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-2">Поддержка</h1>
      <p className="text-gray-400 mb-4">Номер обращения: {ticket.ticketNumber}</p>

      <div className="bg-cardbg border border-borderLight rounded-xl p-4 mb-4 text-sm text-gray-300">
        <p>Режим работы поддержки: ежедневно с 10:00 до 18:00.</p>
        <p>Администратор уже получил уведомление и постарается ответить в течение 15 минут (в рабочее время).</p>
        {isGuest && !ticket.customerEmail && (
          <p className="mt-2 text-yellow-400">
            Вы не указали email. Чтобы получить уведомление об ответе, сохраните эту страницу или добавьте email в профиле.
          </p>
        )}
      </div>

      {/* Переписка */}
      <div className="bg-cardbg border border-borderLight rounded-xl p-4 max-h-96 overflow-y-auto space-y-3 mb-4">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderType === 'admin'
                ? 'justify-end'
                : msg.senderType === 'system'
                ? 'justify-center'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.senderType === 'admin'
                  ? 'bg-accent text-white'
                  : msg.senderType === 'system'
                  ? 'bg-gray-700 text-gray-300 text-center text-sm'
                  : 'bg-[#0f2a42] text-gray-200'
              }`}
            >
              {msg.senderType !== 'system' && (
                <div className="text-xs opacity-75 mb-1">
                  {msg.senderType === 'admin'
                    ? `Поддержка (${msg.admin?.name || 'Администратор'})`
                    : 'Вы'}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Поле ввода */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-3 rounded bg-cardbg border border-borderLight text-white"
          placeholder="Ваше сообщение..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="bg-accent px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}