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
        <div className="w-[90%] aspect-[4/5] bg-gray-800 flex items-center justify-center text-gray-400">
          Нет фото
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div
        className="relative mx-auto max-w-[90%] aspect-[4/5] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[current]}
          alt={`Фото ${current + 1}`}
          fill
          className="object-contain"   // ← теперь картинка вписывается без обрезки
          priority
          sizes="90vw"
        />
      </div>

      {/* Стрелки поверх, не влияют на размер */}
      {showArrows && images.length > 1 && (
        <>
          {current > 0 && (
            <button
              onClick={() => setCurrent(prev => prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent(prev => prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white"
              aria-label="Следующее изображение"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </>
      )}

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto mt-3 pb-2 max-w-[90%] mx-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-transform duration-200 ${
                idx === current ? 'scale-125 z-10 shadow-lg' : 'opacity-60 hover:opacity-100'
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