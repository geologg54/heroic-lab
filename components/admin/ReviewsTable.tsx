// components/admin/ReviewsTable.tsx
'use client'

import { Check, X, Star, Edit2, Save, XCircle } from 'lucide-react'

interface Review {
  id: string
  authorName?: string | null
  user?: { name: string | null } | null
  text: string
  rating: number
  images: string[]
  featured: boolean
  isExternal?: boolean
  status: string
  createdAt: string
  sourceUrl?: string | null
}

interface ReviewsTableProps {
  reviews: Review[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onToggleFeatured: (id: string, current: boolean) => void
  editingId: string | null
  editText: string
  editSourceUrl: string
  onStartEdit: (review: Review) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string) => void
  onEditTextChange: (val: string) => void
  onEditSourceUrlChange: (val: string) => void
}

/**
 * Таблица отзывов с возможностью модерации и редактирования.
 */
export default function ReviewsTable({
  reviews,
  onApprove,
  onReject,
  onToggleFeatured,
  editingId,
  editText,
  editSourceUrl,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditTextChange,
  onEditSourceUrlChange,
}: ReviewsTableProps) {
  if (reviews.length === 0) {
    return <div className="text-gray-400">Нет отзывов</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-borderLight text-gray-400">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Автор</th>
            <th className="p-3">Текст</th>
            <th className="p-3">Оценка</th>
            <th className="p-3">Фото</th>
            <th className="p-3">На главной</th>
            <th className="p-3">Дата</th>
            <th className="p-3">Ссылка</th>
            <th className="p-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-t border-borderLight">
              <td className="p-3 text-xs font-mono">{r.id.slice(-6)}</td>
              <td className="p-3">{r.authorName || r.user?.name || 'Анонимно'}</td>
              <td className="p-3">
                {editingId === r.id ? (
                  <input
                    value={editText}
                    onChange={(e) => onEditTextChange(e.target.value)}
                    className="w-full bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-white"
                  />
                ) : (
                  <span className="line-clamp-2">{r.text}</span>
                )}
              </td>
              <td className="p-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < r.rating ? '#fbbf24' : 'none'}
                      color={i < r.rating ? '#fbbf24' : '#9ca3af'}
                    />
                  ))}
                </div>
              </td>
              <td className="p-3">{r.images?.length || 0}</td>
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={r.featured}
                  onChange={() => onToggleFeatured(r.id, r.featured)}
                  className="w-4 h-4 accent-accent"
                />
              </td>
              <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td className="p-3">
                {editingId === r.id ? (
                  <input
                    value={editSourceUrl}
                    onChange={(e) => onEditSourceUrlChange(e.target.value)}
                    className="w-full bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-white text-xs"
                  />
                ) : r.sourceUrl ? (
                  <a href={r.sourceUrl} target="_blank" className="text-accent underline text-xs">
                    открыть
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => onApprove(r.id)} className="text-green-400">
                        <Check size={18} />
                      </button>
                      <button onClick={() => onReject(r.id)} className="text-red-400">
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {r.isExternal &&
                    (editingId === r.id ? (
                      <>
                        <button onClick={() => onSaveEdit(r.id)} className="text-green-400">
                          <Save size={18} />
                        </button>
                        <button onClick={onCancelEdit} className="text-red-400">
                          <XCircle size={18} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => onStartEdit(r)} className="text-blue-400">
                        <Edit2 size={18} />
                      </button>
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}