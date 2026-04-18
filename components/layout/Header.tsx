// components/layout/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, Search, Heart, User, ShoppingBag, LogOut } from 'lucide-react'
import MobileDrawer from './MobileDrawer'
import SearchBar from '@/components/common/SearchBar'
import { useCart } from '@/hooks/useCart'

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { data: session, status } = useSession()
  const { totalItems } = useCart()

  const isLoading = status === 'loading'

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-darkbg/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        {/* Мобильная версия (до lg) — flex вместо grid */}
        <div className="lg:hidden flex items-center justify-between gap-2">
          <button onClick={() => setIsDrawerOpen(true)} className="text-white shrink-0">
            <Menu size={28} />
          </button>

          <Link href="/" className="flex justify-center">
            <img
              src="/logo-mobile.png"
              alt="Героическая лаборатория миниатюр"
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/search" className="text-white">
              <Search size={22} />
            </Link>
            <Link href="/account/favorites" className="text-white">
              <Heart size={22} />
            </Link>
            <Link href="/cart" className="relative text-white">
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Десктопная версия (lg и выше) */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden text-white">
            <Menu size={28} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Героическая лаборатория миниатюр"
              className="h-[50px] w-auto"
            />
          </Link>

          <div className="flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/search" className="md:hidden text-white">
              <Search size={22} />
            </Link>
            <Link href="/account/favorites" className="text-white">
              <Heart size={22} />
            </Link>

            {isLoading ? (
              <span className="w-6 h-6" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="text-white hidden sm:inline">
                  <User size={22} />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-white hidden sm:inline"
                  title="Выйти"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-white hidden sm:inline">
                <User size={22} />
              </Link>
            )}

            <Link href="/cart" className="relative text-white">
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  )
}