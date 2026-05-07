// components/admin/AdminProductsImportModal.tsx
'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'

interface AdminProductsImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => Promise<{ created: number; updated: number; errors: string[] }>
}

/**
 * Модальное окно импорта товаров из CSV.
 */
export default function AdminProductsImportModal({
  isOpen,
  onClose,
  onImport,
}: AdminProductsImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    try {
      const res = await onImport(file)
      setResult(res)
    } catch {
      alert('Ошибка импорта')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Импорт товаров из CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 text-white"
        />

        {result && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
            <p className="text-green-300">Импорт завершён!</p>
            <p className="text-white text-sm">
              Создано: {result.created}, обновлено: {result.updated}
              {result.errors?.length > 0 && (
                <span className="text-yellow-300">, ошибок: {result.errors.length}</span>
              )}
            </p>
            {result.errors?.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-gray-400 cursor-pointer">Подробнее</summary>
                <ul className="text-xs text-red-300 mt-1 list-disc pl-4">
                  {result.errors.slice(0, 10).map((err, i) => (
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
            disabled={importing || !file}
            className="bg-accent px-4 py-2 rounded-lg text-white disabled:opacity-50"
          >
            {importing ? 'Загрузка...' : 'Загрузить'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 px-4 py-2 rounded-lg text-white"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}