// components/product/ProductGallery.tsx
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-transparent rounded-xl flex items-center justify-center text-gray-400">
        Нет изображения
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const getImageIndex = (offset: number): number => {
    if (images.length === 0) return 0
    let idx = (currentIndex + offset) % images.length
    if (idx < 0) idx += images.length
    return idx
  }

  const slots = [-2, -1, 0, 1, 2]

  const getSlotWidth = (offset: number): string => {
    const absOffset = Math.abs(offset)
    if (absOffset === 0) return '30%'
    if (absOffset === 1) return '14.5%'
    return '8%'
  }

  const handleSlotClick = (clickedOffset: number) => {
    if (clickedOffset === 0) return
    if (clickedOffset < 0) {
      const steps = Math.abs(clickedOffset)
      let newIndex = currentIndex
      for (let i = 0; i < steps; i++) {
        newIndex = newIndex === 0 ? images.length - 1 : newIndex - 1
      }
      setCurrentIndex(newIndex)
    } else {
      const steps = clickedOffset
      let newIndex = currentIndex
      for (let i = 0; i < steps; i++) {
        newIndex = newIndex === images.length - 1 ? 0 : newIndex + 1
      }
      setCurrentIndex(newIndex)
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative w-full flex justify-center items-center gap-0">
        {slots.map((offset, idx) => {
          const imageIndex = getImageIndex(offset)
          const imageSrc = images[imageIndex]
          const widthPercent = getSlotWidth(offset)
          const isCenter = offset === 0

          return (
            <div
              key={idx}
              className="relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out group"
              style={{ width: widthPercent }}
              onClick={() => handleSlotClick(offset)}
            >
              <div className="relative w-full pb-[100%] bg-transparent overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={`Изображение ${imageIndex + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes={`(max-width: 768px) 100vw, ${widthPercent}`}
                  priority={isCenter}
                />
              </div>
            </div>
          )
        })}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-accent text-white rounded-full p-2 transition"
            aria-label="Предыдущее изображение"
            style={{ left: 'calc(8% + 2px)' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-accent text-white rounded-full p-2 transition"
            aria-label="Следующее изображение"
            style={{ right: 'calc(8% + 2px)' }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  )
}