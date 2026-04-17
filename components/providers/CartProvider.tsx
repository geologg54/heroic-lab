// components/providers/CartProvider.tsx
'use client'

import { createContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productArticle: string) => void
  updateQuantity: (productArticle: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // При монтировании загружаем корзину из localStorage (анонимный пользователь)
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      setItems(JSON.parse(stored))
    }
    setIsInitialized(true)
  }, [])

  // Когда сессия загружена и инициализация прошла, синхронизируем с сервером
  useEffect(() => {
    if (!isInitialized) return

    if (session?.user) {
      // Пользователь вошёл – загружаем корзину с сервера
      fetch('/api/cart')
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setItems(data.items)
            localStorage.removeItem('cart') // очищаем локальное хранилище
          }
        })
        .catch(console.error)
    } else {
      // Пользователь вышел – загружаем из localStorage (если осталось)
      const stored = localStorage.getItem('cart')
      if (stored) {
        setItems(JSON.parse(stored))
      }
    }
  }, [session, isInitialized])

  // Сохраняем корзину при изменениях
  useEffect(() => {
    if (!isInitialized) return

    if (session?.user) {
      // Отправляем на сервер
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }).catch(console.error)
    } else {
      // Сохраняем в localStorage
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, session, isInitialized])

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.article === product.article)
      if (existing) {
        return prev.map(i =>
          i.product.article === product.article
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  const removeFromCart = (productArticle: string) => {
    setItems(prev => prev.filter(i => i.product.article !== productArticle))
  }

  const updateQuantity = (productArticle: string, quantity: number) => {
    setItems(prev =>
      prev.map(i =>
        i.product.article === productArticle ? { ...i, quantity } : i
      )
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

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