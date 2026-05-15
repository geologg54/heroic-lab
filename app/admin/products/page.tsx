// app/admin/products/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminProductsToolbar from '@/components/admin/AdminProductsToolbar'
import AdminProductsBatchPanel from '@/components/admin/AdminProductsBatchPanel'
import AdminProductsImportModal from '@/components/admin/AdminProductsImportModal'
import AdminProductsTable from '@/components/admin/AdminProductsTable'
import { SearchFilter } from '@/components/ui/SearchFilter'
import Pagination from '@/components/catalog/Pagination'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const limit = 20

  // Массовое редактирование
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [batchAction, setBatchAction] = useState<'setCategory' | 'setPrice' | null>(null)
  const [batchCategoryId, setBatchCategoryId] = useState('')
  const [batchPrice, setBatchPrice] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [isApplying, setIsApplying] = useState(false)

  // Импорт CSV
  const [showImportModal, setShowImportModal] = useState(false)

  // Сортировка
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Загрузка категорий
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
  }, [])

  // Загрузка товаров
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })
      if (searchQuery) params.set('search', searchQuery)
      if (sortBy) params.set('sortBy', sortBy)
      if (sortOrder) params.set('order', sortOrder)

      const res = await fetch(`/api/admin/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)
      setSelectedArticles(new Set())
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, sortBy, sortOrder])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Удаление
  const handleDelete = async (article: string) => {
    if (!confirm('Удалить товар?')) return
    await fetch(`/api/admin/products/${article}`, { method: 'DELETE' })
    fetchProducts()
  }

  // Поиск
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Пагинация
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Чекбоксы
  const toggleSelectAll = () => {
    if (selectedArticles.size === products.length) {
      setSelectedArticles(new Set())
    } else {
      setSelectedArticles(new Set(products.map((p) => p.article)))
    }
  }

  const toggleSelectOne = (article: string) => {
    const newSet = new Set(selectedArticles)
    if (newSet.has(article)) {
      newSet.delete(article)
    } else {
      newSet.add(article)
    }
    setSelectedArticles(newSet)
  }

  // Массовое применение
  const applyBatchAction = async () => {
    if (selectedArticles.size === 0) {
      alert('Выберите хотя бы один товар')
      return
    }
    if (!batchAction) {
      alert('Выберите действие')
      return
    }

    const updates: any = {}
    if (batchAction === 'setCategory') {
      if (!batchCategoryId) {
        alert('Выберите категорию')
        return
      }
      updates.categoryId = batchCategoryId
    } else if (batchAction === 'setPrice') {
      const price = parseInt(batchPrice)
      if (isNaN(price) || price < 0) {
        alert('Введите корректную цену')
        return
      }
      updates.price = price
    }

    setIsApplying(true)
    try {
      const res = await fetch('/api/admin/products/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: Array.from(selectedArticles),
          updates,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || `Обновлено ${data.updatedCount} товаров`)
        setSelectedArticles(new Set())
        setBatchAction(null)
        setBatchCategoryId('')
        setBatchPrice('')
        fetchProducts()
      } else {
        alert(data.error || 'Ошибка')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setIsApplying(false)
    }
  }

  // Экспорт
  const handleExport = () => {
    if (selectedArticles.size > 0) {
      const articlesList = Array.from(selectedArticles).join(',')
      window.open(`/api/admin/products/export?articles=${encodeURIComponent(articlesList)}`, '_blank')
    } else {
      window.open('/api/admin/products/export', '_blank')
    }
  }

  // Импорт
  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/products/import', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (res.ok) {
      fetchProducts()
    } else {
      throw new Error(data.error || 'Ошибка импорта')
    }
    return data
  }

  // Сортировка
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  if (loading && products.length === 0) {
    return <div className="text-white">Загрузка...</div>
  }

  return (
    <div>
      <AdminProductsToolbar
        onExport={handleExport}
        onImport={() => setShowImportModal(true)}
      />

      <SearchFilter onSearch={handleSearch} placeholder="Поиск по названию или артикулу..." />

      {/* Панель массовых операций */}
      <AdminProductsBatchPanel
        selectedCount={selectedArticles.size}
        batchAction={batchAction}
        setBatchAction={setBatchAction}
        batchCategoryId={batchCategoryId}
        setBatchCategoryId={setBatchCategoryId}
        batchPrice={batchPrice}
        setBatchPrice={setBatchPrice}
        categories={categories}
        onApply={applyBatchAction}
        isApplying={isApplying}
        onCancel={() => {
          setSelectedArticles(new Set())
          setBatchAction(null)
        }}
      />

      {/* Таблица товаров */}
      <AdminProductsTable
        products={products}
        selectedArticles={selectedArticles}
        toggleSelectAll={toggleSelectAll}
        toggleSelectOne={toggleSelectOne}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <div className="mt-2 text-sm text-gray-400">
        {products.length > 0 ? (
          <>Показано {products.length} товаров (страница {currentPage} из {totalPages})</>
        ) : (
          <>Товары не найдены</>
        )}
      </div>

      {/* Модальное окно импорта */}
      <AdminProductsImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  )
}