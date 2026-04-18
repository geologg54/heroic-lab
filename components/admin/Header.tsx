'use client'
import { Menu, Bell, User } from 'lucide-react'

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-darkbg/90 backdrop-blur-md border-b border-[#1e3a5f] px-4 py-3 flex justify-between items-center">
      <button onClick={onMenuClick} className="lg:hidden text-white"><Menu size={24} /></button>
      <div className="flex items-center gap-4 ml-auto">
        <button className="text-gray-300 hover:text-white"><Bell size={20} /></button>
        <div className="flex items-center gap-2 text-white"><User size={20} /><span className="hidden sm:inline">Администратор</span></div>
      </div>
    </header>
  )
}