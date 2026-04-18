'use client'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import CartItem from '@/components/cart/CartItem'
import { EmptyState } from '@/components/common/EmptyState'

export default function CartPage() {
  const { items, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return <EmptyState title="Корзина пуста" message="Добавьте товары из каталога" actionLink="/catalog" actionText="Перейти в каталог" />
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
          <Link href="/checkout" className="block w-full border border-gray-400 hover:bg-accent hover:border-accent text-white text-center py-3 rounded-lg font-semibold transition">
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  )
}