// components/common/NewsletterSection.tsx
'use client'
import { useState } from 'react'

export default function NewsletterSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubscribe = () => {
    // В будущем здесь будет реальная подписка
    setSubmitted(true)
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-6 text-center">
      <h3 className="text-xl font-bold text-white mb-2">Подписка на рассылку</h3>
      <p className="text-gray-400 mb-4 text-sm">
        Получайте новинки, акции и эксклюзивные предложения на почту.
      </p>
      {submitted ? (
        <p className="text-green-400">Спасибо! Вы подписались на рассылку.</p>
      ) : (
        <button
          onClick={handleSubscribe}
          className="bg-accent hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Подписаться
        </button>
      )}
    </div>
  )
}