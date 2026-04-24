// components/admin/ChatConversation.tsx
'use client'
import { useEffect, useState } from 'react'
import { Send, RefreshCw, User } from 'lucide-react'

export const ChatConversation = () => {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loadingList, setLoadingList] = useState(true)

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/support/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }

  const fetchConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedConversation(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    fetchConversation(id)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId) return
    try {
      const res = await fetch(`/api/admin/support/conversations/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })
      if (res.ok) {
        setNewMessage('')
        await fetchConversation(selectedId)
        await fetchConversations()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loadingList) {
    return <div className="text-gray-400 p-6">Загрузка...</div>
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[70vh]">
      {/* Список тикетов */}
      <div className="bg-cardbg border border-borderLight rounded-xl p-2 overflow-y-auto space-y-1">
        {conversations.length === 0 ? (
          <p className="text-gray-400 p-4">Нет обращений</p>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedId === conv.id ? 'bg-accent/20 border border-accent' : 'hover:bg-white/5'
              }`}
            >
              <div className="font-semibold text-white truncate">
                {conv.customerName || conv.customerEmail}
              </div>
              <div className="text-sm text-gray-400 truncate">{conv.subject || 'Без темы'}</div>
              <div className="text-xs text-gray-500 mt-1">{conv.ticketNumber}</div>
            </button>
          ))
        )}
      </div>

      {/* Переписка */}
      <div className="md:col-span-2 bg-cardbg border border-borderLight rounded-xl flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Выберите тикет слева
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-borderLight font-semibold text-white flex justify-between items-center">
              <span>Тикет {selectedConversation.ticketNumber}</span>
              <button onClick={() => fetchConversation(selectedConversation.id)} className="text-gray-400 hover:text-white">
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {selectedConversation.messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-accent text-white' : 'bg-[#0f2a42] text-gray-200'}`}>
                    <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                      <User size={12} />
                      {msg.senderType === 'admin'
                        ? msg.admin?.name || 'Администратор'
                        : 'Клиент'}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-borderLight flex gap-2">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ответ..."
                className="flex-1 p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
              />
              <button onClick={handleSend} disabled={!newMessage.trim()} className="bg-accent p-2 rounded-lg disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}