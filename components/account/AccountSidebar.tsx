// components/account/AccountSidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, Download, Heart, HelpCircle, Settings, LogOut } from 'lucide-react'

export const AccountSidebar = () => {
  const path = usePathname()
  const links = [
    { href: '/account', label: 'Профиль', icon: User },
    { href: '/account/orders', label: 'Заказы', icon: ShoppingBag },
    { href: '/account/downloads', label: 'Загрузки', icon: Download },
    { href: '/account/favorites', label: 'Избранное', icon: Heart },
    { href: '/account/support', label: 'Поддержка', icon: HelpCircle },
    { href: '/account/settings', label: 'Настройки', icon: Settings },
  ]
  return (
    <aside className="w-full md:w-64 bg-cardbg rounded-xl border border-borderLight p-4 h-fit">
      <nav className="space-y-2">
        {links.map(link => (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${path === link.href ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/5'}`}>
            <link.icon size={18} /> {link.label}
          </Link>
        ))}
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 w-full hover:bg-white/5" onClick={() => { localStorage.removeItem('user'); window.location.href = '/' }}><LogOut size={18} /> Выйти</button>
      </nav>
    </aside>
  )
}