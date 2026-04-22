// app/faq/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { faqItems } from '@/faqData'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Заголовок по левому краю */}
      <h1 className="text-3xl font-bold text-white mb-6">Частые вопросы</h1>

      {/* Картинка на всю ширину контейнера */}
      <div className="relative w-full max-w-3xl mx-auto mb-10">
        <Image
          src="/questions.png"
          alt="Частые вопросы"
          width={1200}
          height={800}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* Список вопросов-ответов */}
      <div className="space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              className={`rounded-xl transition-all duration-300 ${
                isOpen
                  ? 'bg-white text-darkbg'
                  : 'bg-transparent text-white'
              }`}
            >
              {/* Заголовок вопроса (всегда кликабельный) */}
              <button
                onClick={() => toggleQuestion(index)}
                className={`w-full flex justify-between items-center p-4 text-left font-semibold ${
                  isOpen ? 'text-darkbg' : 'text-white'
                }`}
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  } ${isOpen ? 'text-darkbg' : 'text-white'}`}
                />
              </button>

              {/* Раскрывающийся контент */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className={`px-4 pb-4 ${isOpen ? 'text-darkbg' : ''}`}>
                  {/* Разбиваем ответ на абзацы */}
                  {item.answer.split('\n\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                  
                  {/* Кнопка, если есть */}
                  {item.hasButton && (
                    <div className="mt-4">
                      <Link
                        href={item.buttonLink || '/'}
                        className="inline-block bg-darkbg text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-80 transition"
                      >
                        {item.buttonText}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}