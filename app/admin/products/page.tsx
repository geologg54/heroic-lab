// app/admin/products/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Download, Upload, X } from 'lucide-react'
import { SearchFilter } from '@/components/ui/SearchFilter'
import Pagination from '@/components/catalog/Pagination'

type BatchAction = 'setCategory' | 'setPrice' | null

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Массовое редактирование
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set())
  const [batchAction, setBatchAction] = useState<BatchAction>(null)
  const [batchCategoryId, setBatchCategoryId] = useState('')
  const [batchPrice, setBatchPrice] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [isApplying, setIsApplying] = useState(false)
  
  // Импорт CSV
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const limit = 20

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

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
    // ===== НОВОЕ: добавляем параметры сортировки =====
    if (sortBy) {
      params.set('sortBy', sortBy)
      params.set('order', sortOrder)
    }
    
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
}, [currentPage, searchQuery, sortBy, sortOrder]) // добавили зависимости

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (article: string) => {
    if (!confirm('Удалить товар?')) return
    await fetch(`/api/admin/products/${article}`, { method: 'DELETE' })
    fetchProducts()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Чекбоксы
  const toggleSelectAll = () => {
    if (selectedArticles.size === products.length) {
      setSelectedArticles(new Set())
    } else {
      setSelectedArticles(new Set(products.map(p => p.article)))
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
          updates
        })
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

  // ЭКСПОРТ CSV – теперь с учётом выбранных товаров
const handleExport = () => {
  // Проверяем, есть ли выбранные товары
  if (selectedArticles.size > 0) {
    // Превращаем Set в массив и склеиваем через запятую
    const articlesList = Array.from(selectedArticles).join(',')
    // Открываем ссылку с параметром ?articles=...
    window.open(`/api/admin/products/export?articles=${encodeURIComponent(articlesList)}`, '_blank')
  } else {
    // Ничего не выбрано – экспортируем всё (старое поведение)
    window.open('/api/admin/products/export', '_blank')
  }
}

  // Импорт CSV
  const handleImport = async () => {
    if (!importFile) {
      alert('Выберите файл')
      return
    }
    setImporting(true)
    setImportResult(null)
    
    const formData = new FormData()
    formData.append('file', importFile)
    
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setImportResult(data)
        fetchProducts()
      } else {
        alert(data.error || 'Ошибка импорта')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setImporting(false)
    }
  }

  // Обработчик клика по заголовку таблицы для сортировки
const handleSort = (column: string) => {
  if (sortBy === column) {
    // Если кликнули по тому же столбцу – переключаем направление
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  } else {
    // Новый столбец – устанавливаем его и сортировку по возрастанию
    setSortBy(column)
    setSortOrder('asc')
  }
  // После изменения сортировки сбрасываем на первую страницу
  setCurrentPage(1)
}

// Возвращает иконку направления сортировки для указанного столбца
const renderSortIndicator = (column: string) => {
  if (sortBy !== column) return null
  return sortOrder === 'asc' ? ' ▲' : ' ▼'
}

  if (loading && products.length === 0) {
    return <div className="text-white">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Товары</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Download size={18} /> Экспорт CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Upload size={18} /> Импорт CSV
          </button>
          <Link
            href="/admin/products/new"
            className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Plus size={18} /> Создать
          </Link>
        </div>
      </div>

      <SearchFilter onSearch={handleSearch} placeholder="Поиск по названию или артикулу..." />

      {/* Панель массовых действий */}
      {selectedArticles.size > 0 && (
        <div className="bg-cardbg border border-borderLight rounded-lg p-4 mb-4 flex flex-wrap items-center gap-4">
          <span className="text-white">
            Выбрано: <strong>{selectedArticles.size}</strong>
          </span>
          
          <select
            value={batchAction || ''}
            onChange={(e) => setBatchAction(e.target.value as BatchAction)}
            className="bg-[#0f2a42] border border-borderLight rounded px-3 py-2 text-white"
          >
            <option value="">Выберите действие...</option>
            <option value="setCategory">Установить категорию</option>
            <option value="setPrice">Установить цену</option>
          </select>

          {batchAction === 'setCategory' && (
            <select
              value={batchCategoryId}
              onChange={(e) => setBatchCategoryId(e.target.value)}
              className="bg-[#0f2a42] border border-borderLight rounded px-3 py-2 text-white"
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}

          {batchAction === 'setPrice' && (
            <input
              type="number"
              min="0"
              placeholder="Новая цена"
              value={batchPrice}
              onChange={(e) => setBatchPrice(e.target.value)}
              className="bg-[#0f2a42] border border-borderLight rounded px-3 py-2 text-white w-40"
            />
          )}

          <button
            onClick={applyBatchAction}
            disabled={isApplying}
            className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
          >
            {isApplying ? 'Применение...' : 'Применить'}
          </button>
          
          <button
            onClick={() => {
              setSelectedArticles(new Set())
              setBatchAction(null)
            }}
            className="text-gray-400 hover:text-white"
          >
            Отмена
          </button>
        </div>
      )}

      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
         <thead className="border-b border-borderLight">
  <tr className="text-gray-400">
    <th className="p-3 w-10">
      <input
        type="checkbox"
        checked={products.length > 0 && selectedArticles.size === products.length}
        onChange={toggleSelectAll}
        className="w-4 h-4 accent-accent"
      />
    </th>
    <th 
      className="p-3 cursor-pointer hover:text-white transition"
      onClick={() => handleSort('article')}
    >
      Артикул{renderSortIndicator('article')}
    </th>
    <th 
      className="p-3 cursor-pointer hover:text-white transition"
      onClick={() => handleSort('name')}
    >
      Название
    </th>
    <th 
      className="p-3 cursor-pointer hover:text-white transition"
      onClick={() => handleSort('price')}
    >
      Цена{renderSortIndicator('price')}
    </th>
    <th 
      className="p-3 cursor-pointer hover:text-white transition"
      onClick={() => handleSort('category')}
    >
      Категория{renderSortIndicator('category')}
    </th>
    <th className="p-3 text-center">Действия</th>
  </tr>
</thead>
<tbody>
  {products.map(p => (
    <tr key={p.article} className="border-t border-borderLight">
      <td className="p-3">
        <input
          type="checkbox"
          checked={selectedArticles.has(p.article)}
          onChange={() => toggleSelectOne(p.article)}
          className="w-4 h-4 accent-accent"
        />
      </td>
      <td className="p-3">{p.article}</td>
      <td className="p-3">{p.name}</td>
      <td className="p-3">{p.price} ₽</td>
      <td className="p-3">{p.category?.name || '—'}</td>
      <td className="p-3">
        <div className="flex items-center justify-center gap-3">
          <Link
            href={`/admin/products/${p.article}`}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Редактировать"
          >
            <Edit size={20} className="text-accent" />
          </Link>
          <button
            onClick={() => handleDelete(p.article)}
            className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
            title="Удалить"
          >
            <Trash2 size={20} className="text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

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

      {/* Модальное окно импорта CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Импорт товаров из CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              Выберите файл CSV. Первая строка должна содержать заголовки колонок.
            </p>
            
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="mb-4 text-white"
            />
            
            {importResult && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
                <p className="text-green-300">Импорт завершён!</p>
                <p className="text-white text-sm">
                  Создано: {importResult.created}, обновлено: {importResult.updated}
                  {importResult.errors?.length > 0 && (
                    <span className="text-yellow-300">, ошибок: {importResult.errors.length}</span>
                  )}
                </p>
                {importResult.errors?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Подробнее</summary>
                    <ul className="text-xs text-red-300 mt-1 list-disc pl-4">
                      {importResult.errors.slice(0, 10).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={importing || !importFile}
                className="bg-accent px-4 py-2 rounded-lg text-white disabled:opacity-50"
              >
                {importing ? 'Загрузка...' : 'Загрузить'}
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="bg-gray-700 px-4 py-2 rounded-lg text-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}