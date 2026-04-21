// app/cart/page.tsx
'use client'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import CartItem from '@/components/cart/CartItem'

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {/* Кастомный блок пустой корзины с адаптивным размером картинки */}
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
          <p className="text-gray-400 mb-6">Наполните её миниатюрами, достойными вашего приключения!</p>
        </div>
        
        <div className="mt-6">
          <Link
            href="/catalog"
            className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Корзина</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => <CartItem key={item.product.article} item={item} />)}
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