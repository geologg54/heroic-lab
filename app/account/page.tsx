'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) router.push('/login')
    else setUser(JSON.parse(stored))
  }, [router])
  if (!user) return null
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Личный кабинет</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 bg-cardbg p-6 rounded-xl border border-borderLight">
          <h2 className="text-xl font-bold mb-4">Привет, {user.email}</h2>
          <p>Здесь будут ваши заказы, загрузки и избранное.</p>
        </div>
      </div>
    </div>
  )
}