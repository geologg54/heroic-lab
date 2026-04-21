// app/faq/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

// Данные для вопросов и ответов
const faqItems = [
  {
    question: 'Миниатюра не сломается?',
    answer: 'Миниатюры предназначены для настольных игр, и для этого они достаточно прочные. Мы сами играем своими миниатюрами, и знаем, о чем говорим.\n\nЕсли вы дадите их маленькому ребенку и он будет бить их друг об друга, то модельки могут не выдержать.\n\nЧтобы упаковать миниатюру, мы используем несколько защитных слоев, поэтому они доедут до вас в целости.'
  },
  {
    question: 'Что значит масштаб 32мм?',
    answer: 'Масштаб 32 мм означает, что при таком масштабировании фигурка человека среднего роста будет в высоту 32 мм. Поэтому, например, гоблин в масштабе 32 мм будет в высоту 28 мм.'
  },
  {
    question: 'Из чего делаются миниатюры?',
    answer: 'Миниатюры печатаются на 3D-принтере из фотополимерной смолы. По умолчанию мы используем Anycubic waterwash 2.0, но вы можете выбрать другую. Для этого нажмите «Выбрать материал» на странице товара.'
  },
  {
    question: 'Что по сборке и покраске?',
    answer: 'Некоторые миниатюры требуют сборки. Вы найдете информацию об этом в разделе «Другие характеристики» на странице товара.\n\nРекомендуем приклеить модели к подставкам для устойчивости. Отлично подходит цианакрилатный клей — самая популярная разновидность суперклея. У него есть небольшой минус: он мгновенно схватывается и потом непросто разделить модель.\nМожно использовать каучуковый (с активатором). Но с ним больше возни.\n\nПеред покраской рекомендуем сперва наносить грунт.'
  },
  {
    question: 'Я не нашел нужную миниатюру',
    answer: 'У нас есть библиотека моделей, которые пока не вошли в каталог. Мы можем их изготовить, но цена и сроки будут определяться индивидуально.',
    hasButton: true,
    buttonText: 'тайная библиотека',
    buttonLink: '/secret-library' // Страница будет создана позже
  },
  {
    question: 'Почему у чумных гончих большие яйца?',
    answer: 'Мы не знаем. Честно.'
  }
]

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
                  {item.answer.split('\n\n').map((paragraph, idx) => (
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