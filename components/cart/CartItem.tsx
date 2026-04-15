// components/cart/CartItem.tsx
'use client'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/hooks/useCart'

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeFromCart } = useCart()
  return (
    <div className="flex gap-4 p-4 bg-cardbg rounded-xl border border-borderLight">
      <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="rounded-lg object-contain bg-black/20" />
      <div className="flex-1">
        <h3 className="text-white font-semibold">{item.product.name}</h3>
        <p className="text-amber-400">{item.product.price} ₽</p>
        <div className="flex items-center gap-3 mt-2">
          <select value={item.quantity} onChange={e => updateQuantity(item.product.id, Number(e.target.value))} className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm">
            {[1,2,3,4,5].map(q => <option key={q}>{q}</option>)}
          </select>
          <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
        </div>
      </div>
    </div>
  )
}