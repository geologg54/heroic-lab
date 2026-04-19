// components/layout/MobileDrawer.tsx
'use client'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 lg:hidden" onClick={onClose} />
      <div className="fixed top-0 left-0 h-full w-64 bg-[#0a1a2f] border-r border-[#1e3a5f] z-50 p-4 transform transition-transform lg:hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-white"><X size={24} /></button>
        <nav className="mt-12 flex flex-col gap-4">
          <Link href="/search" onClick={onClose} className="text-white text-lg py-2">Поиск</Link>
          <Link href="/catalog" onClick={onClose} className="text-white text-lg py-2">Каталог</Link>
          <Link href="/account/favorites" onClick={onClose} className="text-white text-lg py-2">Избранное</Link>
          <Link href="/account" onClick={onClose} className="text-white text-lg py-2">Профиль</Link>
        </nav>
      </div>
    </>
  )
}