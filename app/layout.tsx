// app/layout.tsx
import { Rubik } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/components/providers/CartProvider'
import { FavoritesProvider } from '@/hooks/useFavorites'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const rubik = Rubik({ subsets: ['cyrillic', 'latin'], variable: '--font-rubik' })

export const metadata = {
  title: 'Героическая лаборатория миниатюр',
  description: 'Цифровые 3D-модели для настольных RPG и варгеймов',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={rubik.variable} suppressHydrationWarning>
      <body className="bg-[#05192C] text-gray-200 font-rubik" suppressHydrationWarning>
        <SessionProvider>
          <CartProvider>
            <FavoritesProvider>
              <Header />
              <main className="min-h-screen pt-20">{children}</main>
              <Footer />
            </FavoritesProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}