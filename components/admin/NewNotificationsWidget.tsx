// components/admin/NewNotificationsWidget.tsx
'use client'

import { supportChats } from '@/lib/adminData'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

// Виджет показывает непрочитанные сообщения из чата поддержки
export const NewNotificationsWidget = () => {
  // Считаем общее количество непрочитанных сообщений
  const unreadCount = supportChats.reduce((sum, chat) => sum + chat.unread, 0)
  // Берём первые три чата с непрочитанными сообщениями для отображения
  const latestUnread = supportChats.filter(c => c.unread > 0).slice(0, 3)

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Новые уведомления</h2>
        <Link
          href="/admin/support"
          className="text-accent text-sm hover:underline flex items-center gap-1"
        >
          <MessageCircle size={16} /> Чат поддержки →
        </Link>
      </div>
      {unreadCount === 0 ? (
        <p className="text-gray-400 text-sm">Нет новых сообщений</p>
      ) : (
        <>
          <div className="space-y-2 mb-3">
            {latestUnread.map(chat => (
              <div key={chat.id} className="flex justify-between items-center">
                <span className="text-white">{chat.customer}</span>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {chat.unread}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/support"
            className="block w-full text-center bg-accent/20 hover:bg-accent/30 text-accent py-2 rounded-lg text-sm transition"
          >
            Ответить в чате
          </Link>
        </>
      )}
    </div>
  )
}