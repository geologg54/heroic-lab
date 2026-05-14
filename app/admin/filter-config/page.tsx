// app/admin/filter-config/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Upload, Trash2, Plus, Edit2, Save, X } from 'lucide-react'

interface FilterConfigItem {
  id: string
  categorySlug: string
  filterField: string
  title: string
  type: string
  parentField: string | null
  parentValue: string | null
  sortOrder: number
}

export default function AdminFilterConfigPage() {
  const [configs, setConfigs] = useState<FilterConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Поля формы
  const [form, setForm] = useState({
    categorySlug: '',
    filterField: 'filter1',
    title: '',
    type: 'static',
    parentField: '',
    parentValue: '',
    sortOrder: '0',
  })

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/filter-config')
      if (res.ok) {
        const data = await res.json()
        setConfigs(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки конфигурации:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  // Экспорт CSV
  const handleExport = () => {
    window.open('/api/admin/filter-config/export', '_blank')
  }

  // Импорт CSV
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/filter-config/import', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Импортировано ${data.imported} записей`)
        fetchConfigs()
      } else {
        alert(data.error || 'Ошибка импорта')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Открыть форму создания
  const handleCreate = () => {
    setEditingId(null)
    setForm({
      categorySlug: '',
      filterField: 'filter1',
      title: '',
      type: 'static',
      parentField: '',
      parentValue: '',
      sortOrder: '0',
    })
    setShowForm(true)
  }

  // Открыть форму редактирования
  const handleEdit = (config: FilterConfigItem) => {
    setEditingId(config.id)
    setForm({
      categorySlug: config.categorySlug,
      filterField: config.filterField,
      title: config.title,
      type: config.type,
      parentField: config.parentField || '',
      parentValue: config.parentValue || '',
      sortOrder: config.sortOrder.toString(),
    })
    setShowForm(true)
  }

  // Сохранить (создать или обновить)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId
      ? `/api/admin/filter-config/${editingId}`
      : '/api/admin/filter-config'
    const method = editingId ? 'PUT' : 'POST'

    const payload = {
  ...form,
  sortOrder: parseInt(form.sortOrder) || 0,
  parentField: form.parentField ? form.parentField.replace(/\s/g, '') : null, // <-- убираем пробелы
  parentValue: form.parentValue || null,
};

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setShowForm(false)
        fetchConfigs()
      } else {
        const err = await res.json()
        alert(err.error || 'Ошибка сохранения')
      }
    } catch (error) {
      alert('Ошибка сети')
    }
  }

  // Удалить запись
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту настройку?')) return
    try {
      await fetch(`/api/admin/filter-config/${id}`, { method: 'DELETE' })
      fetchConfigs()
    } catch (error) {
      alert('Ошибка удаления')
    }
  }

  if (loading) {
    return <div className="text-white p-6">Загрузка...</div>
  }

  // Список доступных полей фильтра
  const filterFields = [
    'filter1', 'filter2', 'filter3', 'filter4', 'filter5',
    'filter6', 'filter7', 'filter8', 'filter9', 'filter10',
    'filter11', 'filter12', 'filter13', 'filter14', 'filter15',
    'scale'
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Настройки фильтров</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Download size={18} /> Экспорт CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Upload size={18} /> Импорт CSV
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={handleCreate}
            className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
          >
            <Plus size={18} /> Добавить
          </button>
        </div>
      </div>

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Редактировать' : 'Новая настройка'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-white mb-1">Slug категории*</label>
                <input
                  type="text"
                  value={form.categorySlug}
                  onChange={e => setForm({ ...form, categorySlug: e.target.value })}
                  required
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  placeholder="например: dnd"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Поле фильтра*</label>
                <select
                  value={form.filterField}
                  onChange={e => setForm({ ...form, filterField: e.target.value })}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                >
                  {filterFields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white mb-1">Название*</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Тип*</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                >
                  <option value="static">Статический</option>
                  <option value="dynamic">Динамический</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-1">Родительское поле</label>
                <input
                  type="text"
                  value={form.parentField}
                  onChange={e => setForm({ ...form, parentField: e.target.value })}
                  placeholder="например: filter1"
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Родительское значение</label>
                <input
                  type="text"
                  value={form.parentValue}
                  onChange={e => setForm({ ...form, parentValue: e.target.value })}
                  placeholder="например: герой"
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Порядок сортировки</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="bg-accent px-4 py-2 rounded-lg text-white">
                  <Save size={18} className="inline mr-1" /> Сохранить
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 px-4 py-2 rounded-lg text-white">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Таблица */}
      {configs.length === 0 ? (
        <div className="text-gray-400 bg-cardbg border border-borderLight rounded-xl p-8 text-center">
          <p>Настройки фильтров отсутствуют. Нажмите «Добавить» или импортируйте CSV.</p>
        </div>
      ) : (
        <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-borderLight">
              <tr className="text-gray-400">
                <th className="p-3">Категория</th>
                <th className="p-3">Поле</th>
                <th className="p-3">Название</th>
                <th className="p-3">Тип</th>
                <th className="p-3">Родит. поле</th>
                <th className="p-3">Родит. значение</th>
                <th className="p-3">Порядок</th>
                <th className="p-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.id} className="border-t border-borderLight">
                  <td className="p-3">{c.categorySlug}</td>
                  <td className="p-3">{c.filterField}</td>
                  <td className="p-3">{c.title}</td>
                  <td className="p-3">{c.type === 'dynamic' ? 'Динамический' : 'Статический'}</td>
                  <td className="p-3">{c.parentField || '—'}</td>
                  <td className="p-3">{c.parentValue || '—'}</td>
                  <td className="p-3">{c.sortOrder}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1 rounded hover:bg-white/10 text-accent"
                        title="Редактировать"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 rounded hover:bg-red-900/20 text-red-400"
                        title="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}