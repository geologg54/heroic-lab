// components/providers/CartProvider.tsx
'use client'

import { createContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  addToCart: (
    product: Product,
    quantity?: number,
    options?: { materialId?: string; materialName?: string },
    finalPrice?: number
  ) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

// Генерация уникального ID (можно crypto.randomUUID, но для простоты используем Math.random)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Добавляем cartItemId всем элементам, у которых его нет (старые данные)
        const fixed = parsed.map((item: any) => ({
          ...item,
          cartItemId: item.cartItemId || generateId(),
        }))
        setItems(fixed)
      } catch {}
    }
    setIsInitialized(true)
  }, [])

  // Синхронизация с сервером при изменении сессии
  useEffect(() => {
    if (!isInitialized) return
    if (session?.user) {
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            const fixed = data.items.map((item: any) => ({
              ...item,
              cartItemId: item.cartItemId || generateId(),
            }))
            setItems(fixed)
            localStorage.removeItem('cart')
          }
        })
        .catch(console.error)
    } else {
      const stored = localStorage.getItem('cart')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const fixed = parsed.map((item: any) => ({
            ...item,
            cartItemId: item.cartItemId || generateId(),
          }))
          setItems(fixed)
        } catch {}
      }
    }
  }, [session, isInitialized])

  // Сохранение в localStorage / на сервер при изменении items
  useEffect(() => {
    if (!isInitialized) return
    if (session?.user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product: { article: i.product.article },
            quantity: i.quantity,
            options: i.options,
          })),
        }),
      }).catch(console.error)
    } else {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, session, isInitialized])

  const addToCart = (
    product: Product,
    quantity = 1,
    options?: { materialId?: string; materialName?: string },
    finalPrice?: number
  ) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i =>
          i.product.article === product.article &&
          JSON.stringify(i.options) === JSON.stringify(options)
      )
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      // Новый элемент с уникальным ID
      return [...prev, {
        cartItemId: generateId(),
        product,
        quantity,
        options,
        finalPrice: finalPrice ?? product.price,
      }]
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setItems(prev =>
      prev.map(i =>
        i.cartItemId === cartItemId ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.finalPrice ?? i.product.price) * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}