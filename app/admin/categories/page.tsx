// app/admin/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 🆕 Добавляем поля для названий фильтров в состояние формы
  const [form, setForm] = useState({
    name: '',
    slug: '',
    image: '',
    parentId: '',
    filter1Name: '',
    filter2Name: '',
    filter3Name: '',
    filter4Name: '',
    filter5Name: '',
  })

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
      setForm({
        name: '', slug: '', image: '', parentId: '',
        filter1Name: '', filter2Name: '', filter3Name: '', filter4Name: '', filter5Name: ''
      })
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
      parentId: cat.parentId || '',
      // 🆕 Загружаем существующие названия фильтров
      filter1Name: cat.filter1Name || '',
      filter2Name: cat.filter2Name || '',
      filter3Name: cat.filter3Name || '',
      filter4Name: cat.filter4Name || '',
      filter5Name: cat.filter5Name || '',
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
            setForm({
              name: '', slug: '', image: '', parentId: '',
              filter1Name: '', filter2Name: '', filter3Name: '', filter4Name: '', filter5Name: ''
            })
            setShowForm(true)
          }}
          className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Plus size={18} /> Создать
        </button>
      </div>

      {/* Модальное окно формы */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full my-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Редактировать категорию' : 'Новая категория'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Основные поля */}
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

              {/* 🆕 Поля для названий динамических фильтров */}
              <div className="border-t border-borderLight pt-4 mt-4">
                <h3 className="text-white font-semibold mb-3">Названия фильтров для этой категории</h3>
                <p className="text-gray-400 text-sm mb-3">Оставьте пустыми, если фильтр не нужен</p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Фильтр 1 (например: Фракция)"
                    value={form.filter1Name}
                    onChange={e => setForm({ ...form, filter1Name: e.target.value })}
                    className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  />
                  <input
                    type="text"
                    placeholder="Фильтр 2 (например: Тип войск)"
                    value={form.filter2Name}
                    onChange={e => setForm({ ...form, filter2Name: e.target.value })}
                    className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  />
                  <input
                    type="text"
                    placeholder="Фильтр 3"
                    value={form.filter3Name}
                    onChange={e => setForm({ ...form, filter3Name: e.target.value })}
                    className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  />
                  <input
                    type="text"
                    placeholder="Фильтр 4"
                    value={form.filter4Name}
                    onChange={e => setForm({ ...form, filter4Name: e.target.value })}
                    className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  />
                  <input
                    type="text"
                    placeholder="Фильтр 5"
                    value={form.filter5Name}
                    onChange={e => setForm({ ...form, filter5Name: e.target.value })}
                    className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  />
                </div>
              </div>

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

      {/* Таблица категорий */}
      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">Название</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Родитель</th>
              <th className="p-3">Фильтры</th>
              <th className="p-3 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-t border-borderLight">
                <td className="p-3">{cat.name}</td>
                <td className="p-3">{cat.slug}</td>
                <td className="p-3">{cat.parent?.name || '—'}</td>
                <td className="p-3 text-sm text-gray-300">
                  {/* Показываем, какие фильтры заданы */}
                  {[cat.filter1Name, cat.filter2Name, cat.filter3Name, cat.filter4Name, cat.filter5Name]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Редактировать"
                    >
                      <Edit size={20} className="text-accent" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
    </div>
  )
}