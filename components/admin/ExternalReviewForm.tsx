// components/admin/ExternalReviewForm.tsx
'use client'

import { useRef, useState } from 'react'
import { X, Upload } from 'lucide-react'

interface ExternalReviewFormProps {
  onAdd: (data: { rating: number; sourceUrl: string; files: File[] }) => Promise<void>
}

/**
 * Форма добавления внешнего отзыва.
 */
export default function ExternalReviewForm({ onAdd }: ExternalReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [sourceUrl, setSourceUrl] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files)
    setImages((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (images.length === 0 || !sourceUrl) {
      alert('Заполните обязательные поля')
      return
    }
    setSaving(true)
    try {
      await onAdd({ rating, sourceUrl, files: images })
      // Сброс формы
      setSourceUrl('')
      setImages([])
      setPreviews([])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Добавить внешний отзыв</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-white mb-1">Оценка</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
          >
            {[5, 4, 3, 2, 1].map((i) => (
              <option key={i} value={i}>
                {i} звёзд
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white mb-1">Ссылка на отзыв *</label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Скриншоты отзыва *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-borderLight">
                <img src={src} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 text-accent hover:text-cyan-700">
            <Upload size={20} />
            <span>Загрузить изображения</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-accent hover:bg-cyan-700 px-6 py-2 rounded-lg text-white disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Добавить'}
        </button>
      </div>
    </div>
  )
}