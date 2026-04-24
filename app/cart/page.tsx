// app/cart/page.tsx
'use client'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import CartItem from '@/components/cart/CartItem'
import { useEffect, useState } from 'react'

// Массив комплиментов
const compliments = [
  'Выбор, достойный прославленного вождя',
  'Гоблины перешептываются: «Какой проницательный покупатель! Отличный выбор!»',
  'Даже истинный ценитель признал бы, что вы выбрали лучшие миниатюры. Браво!',
  '*Тени шепчут одобрительно* — вы выбрали лучшие миниатюры',
  '[Проверка проницательности] — критический успех! Вы выбрали идеальные миниатюры',
  'Вы распознали истинные сокровища среди множества вариантов. Отличный выбор!',
  'Отличный выбор! Эти миниатюры ждут эпичных сражений',
  'Ваше чувство вкуса невозможно утаить',
  'Капитан, вы подобрали безупречную команду миниатюр',
  'Мудрость вождя и глаз стратега — вы подобрали идеальный отряд',
  'Тени древних героев одобряют ваш выбор',
  'Вы тонко чувствуете, это будет мудрым приобретением',
  'Ваш выбор заинтересовал бы даже величайших летописцев',
  'Вы словно прочли скрытое послание в линиях судьбы. Превосходный выбор!',
  'Вы подобрали миниатюры с душой. Замечательный выбор!',
  'Вы собрали ансамбль, достойный королевского двора!',
  'Сразу видно, что выбор сделан с умом и сердцем',
  'Вы точно знаете, что делает игру незабываемой. Отличный выбор!',
  'Магическая интуиция не подвела — отличный выбор!',
  'Эти миньки оживят любую игру. Мудрое решение!',
  'Так выбирает истинный стратег!',
  'У вас безупречный вкус, искатель приключений!',
  'Многие позавидуют такой избирательности!',
  'Друиды отмечают гармонию в этих миниатюрах — выбор безупречен.',
  'Лесные духи одобрительно кивают при виде выбора',
  'кристалл истины подтверждает правильность выбора',
  'Капитан стражи одобрительно кивает: с таким отрядом ни один враг не страшен',
]

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [compliment, setCompliment] = useState('')

  useEffect(() => {
    // Выбираем случайный комплимент при монтировании
    const randomIndex = Math.floor(Math.random() * compliments.length)
    setCompliment(compliments[randomIndex])
  }, [])

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex flex-col items-center py-20 px-4">
          <div className="relative w-32 h-32 md:w-64 md:h-64 mb-4">
            <Image
              src="/card-empty.png"
              alt="Корзина пуста"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Корзина пуста</h2>
          <p className="text-gray-400 mb-6">Добавьте товары из каталога</p>
        </div>
        
        <div className="mt-6">
          <Link
            href="/catalog"
            className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Случайный комплимент вместо заголовка */}
      <h1 className="text-3xl font-bold text-white mb-2">{compliment}</h1>
      <p className="text-gray-400 text-lg mb-6">Речь о вашей корзине:</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => <CartItem key={`${item.product.article}_${JSON.stringify(item.options)}`} item={item} />)}
          <button onClick={clearCart} className="text-red-400 text-sm hover:text-red-300">Очистить корзину</button>
        </div>
        <div className="bg-cardbg rounded-xl p-6 border border-borderLight h-fit">
          <h2 className="text-xl font-bold mb-4">Итого</h2>
          <div className="flex justify-between text-lg mb-4">
            <span>Товары ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            <span className="font-bold">{totalPrice} ₽</span>
          </div>
          <Link href="/checkout" className="block w-full border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white text-center py-3 rounded-lg font-semibold transition-colors duration-300">
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  )
}