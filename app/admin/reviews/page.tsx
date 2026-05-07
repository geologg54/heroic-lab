// app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import ReviewsTabs from '@/components/admin/ReviewsTabs'
import ReviewsFilters from '@/components/admin/ReviewsFilters'
import ExternalReviewForm from '@/components/admin/ExternalReviewForm'
import ReviewsTable from '@/components/admin/ReviewsTable'

type Tab = 'pending' | 'approved' | 'rejected' | 'external'

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Фильтры
  const [filterFeatured, setFilterFeatured] = useState('')
  const [filterHasPhoto, setFilterHasPhoto] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Редактирование
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editSourceUrl, setEditSourceUrl] = useState('')

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'external') params.set('status', activeTab)
      else params.set('isExternal', 'true')
      params.set('sortBy', sortBy)
      params.set('order', sortOrder)
      if (filterFeatured) params.set('featured', filterFeatured)
      if (filterHasPhoto) params.set('hasPhoto', filterHasPhoto)
      if (filterRating) params.set('rating', filterRating)

      const res = await fetch(`/api/admin/reviews?${params.toString()}`)
      const data = await res.json()
      setReviews(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [activeTab, filterFeatured, filterHasPhoto, filterRating, sortBy, sortOrder])

  // Модерация
  const handleModeration = async (id: string, status: 'approved' | 'rejected') => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchReviews()
  }

  // Переключение "На главной"
  const toggleFeatured = async (id: string, current: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, featured: !current }),
    })
    fetchReviews()
  }

  // Редактирование внешнего отзыва
  const startEdit = (r: any) => {
    setEditingId(r.id)
    setEditText(r.text || '')
    setEditSourceUrl(r.sourceUrl || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setEditSourceUrl('')
  }

  const saveEdit = async (id: string) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text: editText, sourceUrl: editSourceUrl }),
    })
    setEditingId(null)
    fetchReviews()
  }

  // Добавление внешнего отзыва
  const handleAddExternal = async (data: { rating: number; sourceUrl: string; files: File[] }) => {
    // Загрузка изображений
    const formData = new FormData()
    data.files.forEach((file) => formData.append('images', file))
    const uploadRes = await fetch('/api/reviews/upload', { method: 'POST', body: formData })
    if (!uploadRes.ok) {
      const err = await uploadRes.json()
      throw new Error(err.error || 'Ошибка загрузки')
    }
    const uploadData = await uploadRes.json()
    const imagePaths = uploadData.paths

    // Создание отзыва
    await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: data.rating, text: '', sourceUrl: data.sourceUrl, images: imagePaths }),
    })
    setActiveTab('external')
    fetchReviews()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Управление отзывами</h1>

      <ReviewsTabs activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setEditingId(null) }} />

      <ReviewsFilters
        filterFeatured={filterFeatured} setFilterFeatured={setFilterFeatured}
        filterHasPhoto={filterHasPhoto} setFilterHasPhoto={setFilterHasPhoto}
        filterRating={filterRating} setFilterRating={setFilterRating}
        sortBy={sortBy} setSortBy={setSortBy}
        sortOrder={sortOrder} onToggleSortOrder={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
      />

      {activeTab === 'external' && <ExternalReviewForm onAdd={handleAddExternal} />}

      {loading ? (
        <div className="text-gray-400">Загрузка...</div>
      ) : (
        <ReviewsTable
          reviews={reviews}
          onApprove={(id) => handleModeration(id, 'approved')}
          onReject={(id) => handleModeration(id, 'rejected')}
          onToggleFeatured={toggleFeatured}
          editingId={editingId}
          editText={editText}
          editSourceUrl={editSourceUrl}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onEditTextChange={setEditText}
          onEditSourceUrlChange={setEditSourceUrl}
        />
      )}
    </div>
  )
}