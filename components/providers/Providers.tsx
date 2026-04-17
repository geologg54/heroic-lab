// components/providers/Providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/components/providers/CartProvider'
import { FavoritesProvider } from '@/hooks/useFavorites'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  )
}