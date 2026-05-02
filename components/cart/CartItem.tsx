// components/cart/CartItem.tsx
'use client'
import Image from 'next/image'
import { Trash2, Minus, Plus } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/hooks/useCart'

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeFromCart } = useCart()

  const handleRemove = () => {
    removeFromCart(item.cartItemId)
  }

  const increment = () => updateQuantity(item.cartItemId, item.quantity + 1)
  const decrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.cartItemId, item.quantity - 1)
    } else {
      removeFromCart(item.cartItemId) // если 1 и нажали "–", удаляем товар
    }
  }

  return (
    <div className="flex gap-4 p-4 bg-cardbg rounded-xl border border-borderLight">
      <Image
        src={item.product.image}
        alt={item.product.name}
        width={80}
        height={80}
        className="rounded-lg object-contain bg-black/20"
      />
      <div className="flex-1">
        <h3 className="text-white font-semibold">{item.product.name}</h3>
        {item.options?.materialName && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
            Изменён материал: {item.options.materialName}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-amber-400 font-bold">{item.finalPrice ?? item.product.price} ₽</span>
          {item.product.oldPrice && (
            <span className="text-gray-500 line-through text-sm">{item.product.oldPrice} ₽</span>
          )}
        </div>
        {/* Новый блок с кнопками +/- */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={decrement}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0f2a42] border border-borderLight text-white hover:bg-white hover:text-darkbg transition"
          >
            <Minus size={16} />
          </button>
          <span className="text-white w-6 text-center">{item.quantity}</span>
          <button
            onClick={increment}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0f2a42] border border-borderLight text-white hover:bg-white hover:text-darkbg transition"
          >
            <Plus size={16} />
          </button>
          <button onClick={handleRemove} className="ml-3 text-red-400 hover:text-red-300">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}