// components/product/ProductGallery.tsx
'use client'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductGallery({ images }: { images: string[] }) {
  const [main, setMain] = useState(images[0])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5)
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    checkScrollButtons()
    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)
    return () => {
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [images])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 200
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    setTimeout(checkScrollButtons, 200)
  }

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {/* Главное изображение с защитой от выхода */}
      <div className="relative w-full aspect-square bg-[#0a1220] rounded-xl overflow-hidden border border-borderLight">
        <Image
          src={main}
          alt="Главное фото"
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />
      </div>

      {/* Блок миниатюр с кнопками */}
      <div className="relative w-full max-w-full">
        {/* Кнопка влево (только десктоп) */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-accent text-white rounded-full p-1 transition"
            aria-label="Прокрутить влево"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Горизонтальный скролл для миниатюр (работает на тач-устройствах) */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch', // плавная прокрутка на iOS
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex gap-2 min-w-max">
            {images.map((img) => (
              <button
                key={img}
                onClick={() => setMain(img)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition ${
                  main === img ? 'border-accent' : 'border-transparent hover:border-gray-500'
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-contain bg-black/20"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка вправо */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-accent text-white rounded-full p-1 transition"
            aria-label="Прокрутить вправо"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  )
}