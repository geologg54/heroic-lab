// app/admin/layout.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/Header'
import { Rubik } from 'next/font/google'

const rubik = Rubik({ subsets: ['cyrillic', 'latin'] })

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`${rubik.className} bg-darkbg min-h-screen`}>
      {/* Боковая панель: на десктопе видна всегда, на мобилке — по кнопке */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Основной контент: на десктопе с отступом слева под ширину боковой панели */}
      <div className="lg:ml-64">
        {/* Верхняя шапка с кнопкой меню для мобильных */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Содержимое страницы */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}