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
    <div className="relative h-[75vh] min-h-[400px] -mt-20 bg-darkbg flex flex-col">
      {/* Фоновое изображение */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      
      {/* Вертикальный градиент */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-darkbg"
        style={{ backgroundPosition: 'center', backgroundSize: 'cover' }}
      />

      {/* Контент — теперь управляем отступами напрямую */}
      <div className="relative z-40 px-4 flex flex-col items-center flex-1 mt-80 md:mt-0 md:justify-center">
        {/* Кнопка — на мобилке первая, на десктопе третья */}
        <div className="order-1 md:order-3">
          <Link 
            href={ctaLink} 
            className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            {ctaText}
          </Link>
        </div>

        {/* Заголовок */}
        <h1 className="order-2 md:order-1 text-4xl md:text-6xl font-bold text-white mt-32 mb-4 text-left md:text-center pl-[10%] md:pl-0">
          {title}
        </h1>

        {/* Подзаголовок */}
        <p className="order-3 md:order-2 text-xl text-gray-300 mb-8">
          {subtitle}
        </p>
      </div>
    </div>
  )
}