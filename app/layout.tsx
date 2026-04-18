// app/layout.tsx
import { Rubik } from 'next/font/google'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const rubik = Rubik({ subsets: ['cyrillic', 'latin'], variable: '--font-rubik' })

export const metadata = {
  title: 'Героическая лаборатория миниатюр',
  description: '3D-печатные миниатюры для настольных игр',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={rubik.variable} suppressHydrationWarning>
      <body className="bg-darkbg text-gray-200 font-rubik" suppressHydrationWarning>   {/* изменено */}
        <Providers>
          <Header />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}