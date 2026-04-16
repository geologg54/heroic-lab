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
  mobileBackgroundImage?: string   // добавим опционально, если нужно передавать извне
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px = md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentBg = isMobile ? mobileBackgroundImage : backgroundImage

  return (
    <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-gradient-to-r from-[#05192C] to-[#0a2a3f]">
      {/* Фоновое изображение */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-300"
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
        <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
        <Link href={ctaLink} className="inline-block bg-accent hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition">
          {ctaText}
        </Link>
      </div>
    </div>
  )
}