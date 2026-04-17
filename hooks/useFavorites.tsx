// hooks/useFavorites.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (article: string) => void
  isFavorite: (article: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('favorites')
    if (stored) setFavorites(JSON.parse(stored))
  }, [])

  const toggleFavorite = (article: string) => {
    const newFavs = favorites.includes(article)
      ? favorites.filter(f => f !== article)
      : [...favorites, article]
    setFavorites(newFavs)
    localStorage.setItem('favorites', JSON.stringify(newFavs))
  }

  const isFavorite = (article: string) => favorites.includes(article)

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}