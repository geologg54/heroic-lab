// components/admin/AdminProductsBatchPanel.tsx
'use client'

type BatchAction = 'setCategory' | 'setPrice' | null

interface AdminProductsBatchPanelProps {
  selectedCount: number
  batchAction: BatchAction
  setBatchAction: (action: BatchAction) => void
  batchCategoryId: string
  setBatchCategoryId: (id: string) => void
  batchPrice: string
  setBatchPrice: (price: string) => void
  categories: { id: string; name: string }[]
  onApply: () => void
  isApplying: boolean
  onCancel: () => void
}

/**
 * Панель массовых операций над товарами.
 * Появляется, когда выбраны товары.
 */
export default function AdminProductsBatchPanel({
  selectedCount,
  batchAction,
  setBatchAction,
  batchCategoryId,
  setBatchCategoryId,
  batchPrice,
  setBatchPrice,
  categories,
  onApply,
  isApplying,
  onCancel,
}: AdminProductsBatchPanelProps) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-cardbg border border-borderLight rounded-lg p-4 mb-4 flex flex-wrap items-center gap-4">
      <span className="text-white">
        Выбрано: <strong>{selectedCount}</strong>
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
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
        onClick={onApply}
        disabled={isApplying}
        className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
      >
        {isApplying ? 'Применение...' : 'Применить'}
      </button>

      <button
        onClick={onCancel}
        className="text-gray-400 hover:text-white"
      >
        Отмена
      </button>
    </div>
  )
}