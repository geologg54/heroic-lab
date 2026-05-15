// components/admin/OrdersBatchActions.tsx
'use client'

interface OrdersBatchActionsProps {
  selectedOrderIds: Set<string>
  batchStatus: string
  setBatchStatus: (v: string) => void
  sendNotifications: boolean
  setSendNotifications: (v: boolean) => void
  onApply: () => void
  applyingBatch: boolean
  onCancel: () => void
}

export default function OrdersBatchActions({
  selectedOrderIds,
  batchStatus,
  setBatchStatus,
  sendNotifications,
  setSendNotifications,
  onApply,
  applyingBatch,
  onCancel,
}: OrdersBatchActionsProps) {
  if (selectedOrderIds.size === 0) return null

  return (
    <div className="bg-cardbg border border-borderLight rounded-lg p-4 mb-4 flex flex-wrap items-center gap-4">
      <span className="text-white">Выбрано заказов: <strong>{selectedOrderIds.size}</strong></span>
      <select value={batchStatus} onChange={(e) => setBatchStatus(e.target.value)} className="bg-[#0f2a42] border border-borderLight rounded px-3 py-2 text-white">
        <option value="">Выберите новый статус...</option>
        <option value="processing">В обработке</option>
        <option value="in_delivery">Передано в доставку</option>
        <option value="shipped">Отправлен</option>
        <option value="delivered">Доставлен</option>
        <option value="cancelled">Отменён</option>
      </select>
      <label className="flex items-center gap-2 text-white">
        <input type="checkbox" checked={sendNotifications} onChange={(e) => setSendNotifications(e.target.checked)} />
        Отправить уведомления покупателям
      </label>
      <button onClick={onApply} disabled={applyingBatch} className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white disabled:opacity-50">
        {applyingBatch ? 'Применение...' : 'Применить'}
      </button>
      <button onClick={onCancel} className="text-gray-400 hover:text-white">Отмена</button>
    </div>
  )
}