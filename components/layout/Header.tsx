// components/layout/Header.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, Heart, User, ShoppingBag, X } from 'lucide-react'
import MobileDrawer from './MobileDrawer'
import SearchBar from '@/components/common/SearchBar'
import { useCart } from '@/hooks/useCart'

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#05192C]/90 backdrop-blur-md border-b border-[#1e3a5f]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden text-white">
          <Menu size={28} />
        </button>
        <Link href="/" className="flex items-center gap-2">
  <img 
  src="/logo.png" 
  alt="Героическая лаборатория миниатюр" 
  className="h-10 w-auto block"   // добавили 'block'
/>
</Link>
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/search" className="md:hidden text-white"><Search size={22} /></Link>
          <Link href="/account/favorites" className="text-white"><Heart size={22} /></Link>
          <Link href="/account" className="text-white hidden sm:inline"><User size={22} /></Link>
          <Link href="/cart" className="relative text-white">
            <ShoppingBag size={22} />
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}
          </Link>
        </div>
      </div>
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  )
}