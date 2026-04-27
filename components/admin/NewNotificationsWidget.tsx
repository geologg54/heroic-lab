// components/admin/NewNotificationsWidget.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export const NewNotificationsWidget = () => {
  const [openTicketsCount, setOpenTicketsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/support/conversations')
      .then(res => res.json())
      .then(data => {
        // data – массив тикетов, считаем открытые
        const open = data.filter((c: any) => c.status === 'open').length
        setOpenTicketsCount(open)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-gray-400">Загрузка...</div>

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Обращения</h2>
        <Link href="/admin/support" className="text-accent text-sm hover:underline flex items-center gap-1">
          <MessageCircle size={16} /> Чат поддержки →
        </Link>
      </div>
      {openTicketsCount === 0 ? (
        <p className="text-gray-400 text-sm">Новых обращений нет</p>
      ) : (
        <>
          <p className="text-white text-xl font-bold">{openTicketsCount}</p>
          <p className="text-gray-400 text-sm">открытых тикетов</p>
          <Link
            href="/admin/support"
            className="block w-full text-center bg-accent/20 hover:bg-accent/30 text-accent py-2 rounded-lg text-sm transition mt-4"
          >
            Перейти к чату
          </Link>
        </>
      )}
    </div>
  )
}