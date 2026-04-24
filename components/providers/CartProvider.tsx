// components/providers/CartProvider.tsx
'use client'

import { createContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CartItem, Product } from '@/types'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, options?: { materialId?: string; materialName?: string }) => void
  removeFromCart: (productArticle: string, options?: object) => void
  updateQuantity: (productArticle: string, quantity: number, options?: object) => void
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
        body: JSON.stringify({
          items: items.map(i => ({
            product: { article: i.product.article },
            quantity: i.quantity,
            options: i.options,
          })),
        }),
      }).catch(console.error)
    } else {
      // Сохраняем в localStorage
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, session, isInitialized])

  // Добавление товара с учётом опций (материал и т.д.)
  const addToCart = (
    product: Product,
    quantity = 1,
    options?: { materialId?: string; materialName?: string }
  ) => {
    setItems(prev => {
      // Ищем позицию с таким же артикулом И опциями (строгое сравнение)
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
      return [...prev, { product, quantity, options }]
    })
  }

  // Удаление позиции по артикулу и опциям (чтобы удалить именно изменённый вариант)
  const removeFromCart = (productArticle: string, options?: object) => {
    setItems(prev =>
      prev.filter(
        i =>
          !(
            i.product.article === productArticle &&
            JSON.stringify(i.options) === JSON.stringify(options)
          )
      )
    )
  }

  // Обновление количества для конкретной позиции
  const updateQuantity = (productArticle: string, quantity: number, options?: object) => {
    setItems(prev =>
      prev.map(i =>
        i.product.article === productArticle &&
        JSON.stringify(i.options) === JSON.stringify(options)
          ? { ...i, quantity }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  // Суммарные показатели (считаем по базовой цене товара, опции не влияют)
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