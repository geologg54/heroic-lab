// components/catalog/MobileFilterModal.tsx
'use client'

import { X } from 'lucide-react'

interface MobileFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onClearAll: () => void
  onApply: () => void
  children: React.ReactNode
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  onClearAll,
  onApply,
  children,
}: MobileFilterModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 p-4 overflow-auto">
      <div className="bg-cardbg p-6 rounded-xl max-w-md mx-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Фильтры</h2>

        <div className="space-y-4">{children}</div>

        <div className="mt-6 flex gap-4">
          <button onClick={onClearAll} className="text-gray-400 hover:text-white underline">
            Сбросить фильтры
          </button>
          <button
            onClick={onApply}
            className="flex-1 bg-white text-darkbg py-3 rounded-lg font-semibold"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}