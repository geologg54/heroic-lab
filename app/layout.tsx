// app/layout.tsx
import localFont from 'next/font/local'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const rubik = localFont({
  src: [
    {
      path: '../public/fonts/Rubik-VariableFont_wght.ttf',
      weight: '400 700', 
      style: 'normal',
    },
    {
      path: '../public/fonts/Rubik-Italic-VariableFont_wght.ttf',
      weight: '400 700',
      style: 'italic',
    },
  ],
  variable: '--font-rubik', 
})

export const metadata = {
  title: 'Героическая лаборатория миниатюр',
  description: '3D-печатные миниатюры для настольных игр',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={rubik.className} suppressHydrationWarning>
      <body className="bg-darkbg text-gray-200" suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="min-h-screen pt-20">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}