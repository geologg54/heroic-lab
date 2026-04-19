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
  const { totalItems, totalPrice } = useCart()

  const isLoading = status === 'loading'

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-darkbg">
      <div className="container mx-auto px-4 py-3">
        {/* Мобильная версия (до lg) — сетка из трёх колонок для идеального центрирования логотипа */}
        <div className="lg:hidden grid grid-cols-3 items-center">
          {/* Левая колонка: кнопка меню */}
          <div className="justify-self-start">
            <button onClick={() => setIsDrawerOpen(true)} className="text-white">
              <Menu size={28} />
            </button>
          </div>

          {/* Центральная колонка: логотип точно по центру */}
          <Link href="/" className="justify-self-center">
            <img
              src="/logo.png"
              alt="Героическая лаборатория миниатюр"
              className="h-10 w-auto"
            />
          </Link>

          {/* Правая колонка: только корзина */}
          <div className="flex items-center gap-3 justify-self-end">
            <Link href="/cart" className="relative text-white flex items-center gap-1">
              {totalItems > 0 && (
                <span className="text-white font-semibold text-sm">{totalPrice} ₽</span>
              )}
              <img src="/cardicontop.png" alt="Корзина" className="w-8 h-8" />
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
            {/* Корзина (первая слева) */}
            <Link href="/cart" className="relative text-white flex items-center gap-1">
              {totalItems > 0 && (
                <span className="text-white font-semibold text-lg">{totalPrice} ₽</span>
              )}
              <img src="/cardicontop.png" alt="Корзина" className="w-8 h-8" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Избранное */}
            <Link href="/account/favorites" className="text-white">
              <Heart size={22} />
            </Link>

            {/* Поиск (скрыт на md, так как есть SearchBar) */}
            <Link href="/search" className="md:hidden text-white">
              <Search size={22} />
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
          </div>
        </div>
      </div>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  )
}