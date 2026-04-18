// app/admin/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', image: '', parentId: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : '/api/admin/categories'
    const method = editingId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      setShowForm(false)
      setEditingId(null)
      setForm({ name: '', slug: '', image: '', parentId: '' })
      fetchCategories()
    } else {
      const error = await res.json()
      alert(error.error || 'Ошибка сохранения')
    }
  }

  const handleEdit = (cat: any) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || '',
      parentId: cat.parentId || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию?')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchCategories()
    } else {
      const error = await res.json()
      alert(error.error)
    }
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Категории</h1>
        <button
          onClick={() => {
            setEditingId(null)
            setForm({ name: '', slug: '', image: '', parentId: '' })
            setShowForm(true)
          }}
          className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Plus size={18} /> Создать
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Редактировать категорию' : 'Новая категория'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Название"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
              />
              <input
                type="text"
                placeholder="Slug"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
              />
              <input
                type="text"
                placeholder="URL изображения (необязательно)"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
              />
              <select
                value={form.parentId}
                onChange={e => setForm({ ...form, parentId: e.target.value })}
                className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
              >
                <option value="">Нет родительской категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="bg-accent px-4 py-2 rounded-lg text-white">
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-700 px-4 py-2 rounded-lg text-white"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">Название</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Родитель</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-t border-borderLight">
                <td className="p-3">{cat.name}</td>
                <td className="p-3">{cat.slug}</td>
                <td className="p-3">{cat.parent?.name || '—'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-accent">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-400">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}