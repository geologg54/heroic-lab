// components/admin/AdminProductsTable.tsx
'use client'
import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'

interface Product {
  article: string
  name: string
  price: number
  category?: { name: string } | null
}

interface AdminProductsTableProps {
  products: Product[]
  selectedArticles: Set<string>
  toggleSelectAll: () => void
  toggleSelectOne: (article: string) => void
  sortBy: string
  sortOrder: string
  handleSort: (column: string) => void
  onDelete: (article: string) => void
}

/**
 * Таблица товаров с сортировкой, чекбоксами и действиями.
 */
export default function AdminProductsTable({
  products,
  selectedArticles,
  toggleSelectAll,
  toggleSelectOne,
  sortBy,
  sortOrder,
  handleSort,
  onDelete,
}: AdminProductsTableProps) {
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? ' ▲' : ' ▼'
  }

  return (
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
              Название{renderSortIndicator('name')}
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
          {products.map((p) => (
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
                    onClick={() => onDelete(p.article)}
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
  )
}