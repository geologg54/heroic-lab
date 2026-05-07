// components/admin/AdminProductsToolbar.tsx
'use client'
import Link from 'next/link'
import { Plus, Download, Upload } from 'lucide-react'

interface AdminProductsToolbarProps {
  onExport: () => void
  onImport: () => void
}

/**
 * Верхняя панель инструментов: экспорт CSV, импорт CSV, создание товара.
 */
export default function AdminProductsToolbar({ onExport, onImport }: AdminProductsToolbarProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-white">Товары</h1>
      <div className="flex gap-2">
        <button
          onClick={onExport}
          className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Download size={18} /> Экспорт CSV
        </button>
        <button
          onClick={onImport}
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
  )
}