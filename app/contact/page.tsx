// app/contact/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useSupportTicket } from '@/hooks/useSupportTicket'
import ContactForm from '@/components/contact/ContactForm'
import TicketView from '@/components/contact/TicketView'

function ContactContent() {
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('message') || ''
  const { data: session } = useSession()
  const { ticket, loading, error, createTicket, sendMessage } = useSupportTicket()

  // Если есть открытый тикет – показываем переписку
  if (ticket && ticket.status === 'open') {
    return (
      <TicketView
        ticket={ticket}
        onSendMessage={sendMessage}
        loading={loading}
        isGuest={!session?.user}
      />
    )
  }

  // Иначе – форма нового обращения
  return (
    <ContactForm
      initialMessage={initialMessage}
      onSubmit={createTicket}
      loading={loading}
      error={error}
    />
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Загрузка...</div>}>
      <ContactContent />
    </Suspense>
  )
}