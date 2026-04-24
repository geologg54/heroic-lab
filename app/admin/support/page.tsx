// app/admin/support/page.tsx
'use client'
import { ChatConversation } from '@/components/admin/ChatConversation'

export default function AdminSupportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Поддержка</h1>
      <ChatConversation />
    </div>
  )
}