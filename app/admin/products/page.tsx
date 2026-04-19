// app/admin/products/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { SearchFilter } from '@/components/ui/SearchFilter'
import Pagination from '@/components/catalog/Pagination'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // 🆕 Состояния для пагинации и поиска
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  
  const limit = 20 // товаров на странице

  // 🆕 Функция загрузки товаров с учётом пагинации и поиска
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })
      if (searchQuery) {
        params.set('search', searchQuery)
      }
      
      const res = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (article: string) => {
    if (!confirm('Удалить товар?')) return
    await fetch(`/api/admin/products/${article}`, { method: 'DELETE' })
    // Обновляем список после удаления
    fetchProducts()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // сбрасываем на первую страницу при новом поиске
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && products.length === 0) {
    return <div className="text-white">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Товары</h1>
        <Link
          href="/admin/products/new"
          className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Plus size={18} /> Создать
        </Link>
      </div>

      {/* 🆕 Поле поиска */}
      <SearchFilter onSearch={handleSearch} placeholder="Поиск по названию или артикулу..." />

      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">Артикул</th>
              <th className="p-3">Название</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Категория</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.article} className="border-t border-borderLight">
                <td className="p-3">{p.article}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price} ₽</td>
                <td className="p-3">{p.category?.name || '—'}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/products/${p.article}`}>
                    <Edit size={16} className="text-accent" />
                  </Link>
                  <button onClick={() => handleDelete(p.article)}>
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🆕 Пагинация */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 🆕 Информация о количестве найденных товаров */}
      <div className="mt-2 text-sm text-gray-400">
        {products.length > 0 ? (
          <>Показано {products.length} товаров (страница {currentPage} из {totalPages})</>
        ) : (
          <>Товары не найдены</>
        )}
      </div>
    </div>
  )
}