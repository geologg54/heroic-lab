// app/account/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="text-white text-center py-20">Загрузка...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Личный кабинет</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 bg-cardbg p-6 rounded-xl border border-borderLight">
          <h2 className="text-xl font-bold mb-4">
            Привет, {session.user.name || session.user.email}
          </h2>
          <p>Здесь будут ваши заказы, загрузки и избранное.</p>
        </div>
      </div>
    </div>
  )
}