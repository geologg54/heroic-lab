// components/product/FaqModal.tsx
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { faqItems } from '@/lib/faqData';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FaqModal({ isOpen, onClose }: FaqModalProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 pointer-events-auto" onClick={onClose} />
      
      <div className="relative w-[45vw] max-h-[80vh] overflow-y-auto bg-darkbg border-1 border-white rounded-2xl shadow-2xl pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-8 right-10 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>

        {/* Заголовок – без разделителя, отступы как у вопросов */}
        <div className="px-9 pt-7 pb-6">
          <h2 className="text-2xl font-bold text-white">Частые вопросы</h2>
        </div>

        {/* Список вопросов – отступы сохранены */}
        <div className="px-6 pb-6 space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl transition-all duration-300 ${
                  isOpen ? 'bg-white text-darkbg' : 'bg-transparent text-white'
                }`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className={`w-full flex justify-between items-center p-4 text-left font-semibold ${
                    isOpen ? 'text-darkbg' : 'text-white'
                  }`}
                >
                  <span>{item.question}</span>
                  {/* Стрелка скрыта визуально, но сохраняет место и функционал */}
                  <ChevronDown
                    size={20}
                    className={`hidden transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    } ${isOpen ? 'text-darkbg' : 'text-white'}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className={`px-4 pb-4 ${isOpen ? 'text-darkbg' : ''}`}>
                    {item.answer.split('\n\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                    {item.hasButton && (
                      <div className="mt-4">
                        <Link
                          href={item.buttonLink || '/'}
                          className="inline-block bg-darkbg text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-80 transition"
                          onClick={onClose}
                        >
                          {item.buttonText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}