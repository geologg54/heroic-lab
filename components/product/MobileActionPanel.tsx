// components/product/MobileActionPanel.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { useMaterial } from '@/components/product/MaterialProvider'
import FaqModal from '@/components/product/FaqModal'
import Link from 'next/link'
import type { Product } from '@/types'

interface Props {
  product: Product
  open: boolean
  onOpen: () => void
  onClose: () => void
}

export default function MobileActionPanel({ product, open, onOpen, onClose }: Props) {
  const [isFaqOpen, setIsFaqOpen] = useState(false)
  const [showTab, setShowTab] = useState(false)
  const tabTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { openModal } = useMaterial()

  const messages = {
    special: `Добрый день. Хочу обсудить с вами индивидуальный заказ.`,
    scale: `Добрый день. Хочу заказать модель "${product.article}" "${product.name}" в другом масштабе.`,
    question: `Добрый день. У меня возник вопрос о товаре "${product.article}" "${product.name}"`
  }

  // Показать закладку при скролле и спрятать через 1 секунду после остановки
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowTab(true)
        if (tabTimeout.current) clearTimeout(tabTimeout.current)
        tabTimeout.current = setTimeout(() => {
          setShowTab(false)
        }, 1000)
      } else {
        setShowTab(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (tabTimeout.current) clearTimeout(tabTimeout.current)
    }
  }, [])

  return (
    <>
      {/* Закладка (показывается при скролле и исчезает через 1с) */}
      {showTab && (
        <button
          onClick={onOpen}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-l-xl p-2 pr-3 shadow-lg lg:hidden"
          aria-label="Открыть меню действий"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {/* Выдвижная панель */}
      <div
        className={`fixed right-0 top-0 h-full w-4/5 max-w-xs bg-cardbg border-l border-borderLight p-6 z-50 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } lg:hidden`}
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-white">
          <X size={24} />
        </button>

        <div className="mt-16 space-y-6 text-lg text-white">
          <button onClick={() => { openModal(); onClose() }} className="block hover:text-accent transition w-full text-left">
            Изменить материал
          </button>
          <Link href={`/contact?message=${encodeURIComponent(messages.scale)}`} onClick={onClose} className="block hover:text-accent transition">
            Выбрать масштаб
          </Link>
          <Link href={`/contact?message=${encodeURIComponent(messages.special)}`} onClick={onClose} className="block hover:text-accent transition">
            Индивидуальный заказ
          </Link>
          <button onClick={() => { setIsFaqOpen(true); onClose() }} className="block hover:text-accent transition w-full text-left">
            Частые вопросы
          </button>
          <Link href={`/contact?message=${encodeURIComponent(messages.question)}`} onClick={onClose} className="block hover:text-accent transition">
            Вопрос о товаре
          </Link>
        </div>
      </div>

      {/* Затемнение */}
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}

      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </>
  )
}