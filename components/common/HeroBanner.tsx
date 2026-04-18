// components/common/HeroBanner.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface HeroBannerProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage?: string
  mobileBackgroundImage?: string
}

export const HeroBanner = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink, 
  backgroundImage = '/hero-bg.jpg',
  mobileBackgroundImage = '/hero-bg-mobile.jpg' 
}: HeroBannerProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentBg = isMobile ? mobileBackgroundImage : backgroundImage

  return (
    <div className="relative h-[75vh] min-h-[400px] flex items-center justify-center text-center -mt-20 bg-darkbg">
      {/* Фоновое изображение (без прозрачности) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      
      {/* Новый вертикальный градиент: прозрачный сверху, затемнение к низу */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-darkbg"
        style={{ backgroundPosition: 'center', backgroundSize: 'cover' }}
      />

      {/* Контент поверх */}
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
        <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
        <Link 
          href={ctaLink} 
          className="inline-block border border-gray-400 hover:bg-accent hover:border-accent text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  )
}