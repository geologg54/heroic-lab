// components/admin/ChatConversation.tsx
'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'

export const ChatConversation = ({ chat }: any) => {
  const [message, setMessage] = useState('')
  const handleSend = () => {
    alert(`Ответ отправлен: ${message}`)
    setMessage('')
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl h-[600px] flex flex-col">
      <div className="p-4 border-b border-borderLight font-semibold text-white">
        Чат с {chat?.customer}
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        <div className="flex justify-start">
          <div className="bg-[#0f2a42] p-2 rounded-lg max-w-[70%]">
            Здравствуйте, когда появятся новые модели Trench Crusade?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-accent p-2 rounded-lg max-w-[70%]">
            Здравствуйте, новые модели ожидаются на следующей неделе.
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-borderLight flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
        />
        <button onClick={handleSend} className="bg-accent p-2 rounded-lg">
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}