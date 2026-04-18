'use client'
import { useState } from 'react'
import { supportChats } from '@/lib/adminData'
import { ChatConversation } from '@/components/admin/ChatConversation'

export default function SupportPage() {
  const [selectedChat, setSelectedChat] = useState(supportChats[0])

  return (
    <div><h1 className="text-2xl font-bold text-white mb-6">Чат поддержки</h1>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-cardbg border border-borderLight rounded-xl p-2 space-y-1">
        {supportChats.map(chat => <button key={chat.id} onClick={() => setSelectedChat(chat)} className={`w-full text-left p-3 rounded-lg ${selectedChat?.id === chat.id ? 'bg-accent/20 border border-accent' : 'hover:bg-white/5'}`}><div className="font-semibold text-white">{chat.customer}</div><div className="text-sm text-gray-400 truncate">{chat.lastMessage}</div>{chat.unread > 0 && <span className="bg-red-500 text-white text-xs px-1 rounded-full">{chat.unread}</span>}</button>)}
      </div>
      <div className="md:col-span-2"><ChatConversation chat={selectedChat} /></div>
    </div></div>
  )
}