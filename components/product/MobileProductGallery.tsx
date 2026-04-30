// components/product/MobileProductGallery.tsx
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
}

export default function MobileProductGallery({ images }: Props) {
  const [current, setCurrent] = useState(0)
  const [showArrows, setShowArrows] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startX = useRef(0)

  const resetArrowsTimer = useCallback(() => {
    setShowArrows(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setShowArrows(false), 1000)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    resetArrowsTimer()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < images.length - 1) {
        setCurrent(prev => prev + 1)
      } else if (diff < 0 && current > 0) {
        setCurrent(prev => prev - 1)
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => resetArrowsTimer()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [resetArrowsTimer])

  const goTo = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center">
        <div className="w-[75%] aspect-[4/5] bg-gray-800 flex items-center justify-center text-gray-400">
          Нет фото
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Изображение – 75% ширины, центрировано */}
      <div
        className="relative mx-auto max-w-[75%] aspect-[4/5] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[current]}
          alt={`Фото ${current + 1}`}
          fill
          className="object-cover"
          priority
        />
        {showArrows && (
          <>
            {current > 0 && (
              <button
                onClick={() => setCurrent(prev => prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white z-10 backdrop-blur-sm"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={() => setCurrent(prev => prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white z-10 backdrop-blur-sm"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Миниатюры – тоже 75% ширины */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto mt-3 pb-2 max-w-[75%] mx-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-transform duration-200 ${
                idx === current ? 'scale-125 z-10 shadow-lg' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Миниатюра ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}