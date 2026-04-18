// app/account/downloads/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default function DownloadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') return <div className="text-white text-center py-20">Загрузка...</div>
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Мои загрузки</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 bg-cardbg p-6 rounded-xl border border-borderLight">
          <p className="text-gray-400">У вас пока нет цифровых товаров для скачивания.</p>
        </div>
      </div>
    </div>
  )
}   