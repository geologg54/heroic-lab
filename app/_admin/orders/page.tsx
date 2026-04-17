// app/admin/support/page.tsx
'use client'
import { useState } from 'react'
import { ChatConversation } from '@/components/admin/ChatConversation'

// Моковые данные для списка чатов поддержки
const supportChats = [
  {
    id: 'chat1',
    customer: 'Алексей Смирнов',
    lastMessage: 'Когда будут новые модели?',
    unread: 2,
    status: 'open',
    updatedAt: '2025-04-14T10:30',
  },
  {
    id: 'chat2',
    customer: 'Мария Козлова',
    lastMessage: 'Спасибо за быструю доставку!',
    unread: 0,
    status: 'closed',
    updatedAt: '2025-04-13T15:20',
  },
  {
    id: 'chat3',
    customer: 'Дмитрий Иванов',
    lastMessage: 'Не могу скачать файл, помогите',
    unread: 3,
    status: 'open',
    updatedAt: '2025-04-14T09:15',
  },
  {
    id: 'chat4',
    customer: 'Елена Петрова',
    lastMessage: 'Есть ли скидка для новичков?',
    unread: 1,
    status: 'open',
    updatedAt: '2025-04-13T18:45',
  },
]

export default function SupportPage() {
  const [selectedChat, setSelectedChat] = useState(supportChats[0])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Чат поддержки</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Список чатов – левая колонка */}
        <div className="bg-cardbg border border-borderLight rounded-xl p-2 space-y-1 h-[600px] overflow-y-auto">
          {supportChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedChat?.id === chat.id
                  ? 'bg-accent/20 border border-accent'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="font-semibold text-white">{chat.customer}</div>
              <div className="text-sm text-gray-400 truncate">{chat.lastMessage}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{new Date(chat.updatedAt).toLocaleDateString('ru-RU')}</span>
                {chat.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Область активного чата – правая колонка */}
        <div className="md:col-span-2">
          <ChatConversation chat={selectedChat} />
        </div>
      </div>
    </div>
  )
}