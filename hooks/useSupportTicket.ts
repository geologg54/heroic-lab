// hooks/useSupportTicket.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

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
}

interface UseSupportTicketReturn {
  ticket: Ticket | null
  loading: boolean
  error: string
  fetchTicket: (id: string) => Promise<void>
  createTicket: (data: { message: string; email?: string; name?: string }) => Promise<void>
  sendMessage: (message: string) => Promise<void>
  clearTicket: () => void
}

/**
 * Хук для работы с тикетом поддержки.
 * Автоматически восстанавливает тикет из localStorage при монтировании.
 */
export function useSupportTicket(): UseSupportTicketReturn {
  const { data: session } = useSession()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // При монтировании проверяем localStorage
  useEffect(() => {
    const storedId = localStorage.getItem('supportTicketId')
    if (storedId) {
      fetchTicket(storedId)
    }
  }, [])

  // Загрузка тикета по ID
  const fetchTicket = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/support/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'open') {
          setTicket(data)
          localStorage.setItem('supportTicketId', data.id)
        } else {
          setTicket(null)
          localStorage.removeItem('supportTicketId')
        }
      } else {
        setTicket(null)
        localStorage.removeItem('supportTicketId')
      }
    } catch (err) {
      console.error(err)
      setError('Ошибка загрузки тикета')
    } finally {
      setLoading(false)
    }
  }

  // Создание нового тикета
  const createTicket = async (data: { message: string; email?: string; name?: string }) => {
    setLoading(true)
    setError('')

    const payload: any = { message: data.message }
    if (!session?.user) {
      if (data.email) payload.email = data.email
      if (data.name) payload.name = data.name
    }

    try {
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) {
        setError(responseData.error || 'Ошибка отправки')
        return
      }

      localStorage.setItem('supportTicketId', responseData.id)
      await fetchTicket(responseData.id)
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  // Отправка сообщения в существующий тикет
  const sendMessage = async (message: string) => {
    if (!ticket || !message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/support/conversations/${ticket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (res.ok) {
        await fetchTicket(ticket.id) // обновляем переписку
      } else {
        const err = await res.json()
        setError(err.error || 'Ошибка отправки')
      }
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  const clearTicket = useCallback(() => {
    setTicket(null)
    localStorage.removeItem('supportTicketId')
  }, [])

  return { ticket, loading, error, fetchTicket, createTicket, sendMessage, clearTicket }
}