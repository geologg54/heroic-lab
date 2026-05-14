// components/admin/ProductForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  filter1Name?: string | null
  filter2Name?: string | null
  filter3Name?: string | null
  filter4Name?: string | null
  filter5Name?: string | null
  filter6Name?: string | null
  filter7Name?: string | null
  filter8Name?: string | null
  filter9Name?: string | null
  filter10Name?: string | null
  filter11Name?: string | null
  filter12Name?: string | null
  filter13Name?: string | null
  filter14Name?: string | null
  filter15Name?: string | null
}

export const ProductForm = ({ productArticle }: { productArticle?: string }) => {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  const [form, setForm] = useState({
    article: '',
    name: '',
    price: '',
    oldPrice: '',
    description: '',
    images: '',
    categoryId: '',
    scale: '32mm',
    tags: '',
    filter1: '', filter2: '', filter3: '', filter4: '', filter5: '',
    filter6: '', filter7: '', filter8: '', filter9: '', filter10: '',
    filter11: '', filter12: '', filter13: '', filter14: '', filter15: '',
    stock: '0',
    heightMax: '', baseMax: '', heightMin: '', baseMin: '',
    assembly: '', contents: '', artist: '',
  })

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  useEffect(() => {
    if (productArticle) {
      fetch(`/api/admin/products/${productArticle}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            article: data.article,
            name: data.name,
            price: data.price.toString(),
            oldPrice: data.oldPrice?.toString() || '',
            description: data.description,
            images: data.images,
            categoryId: data.categoryId,
            scale: data.scale,
            tags: data.tags,
            filter1: data.filter1 || '', filter2: data.filter2 || '', filter3: data.filter3 || '', filter4: data.filter4 || '', filter5: data.filter5 || '',
            filter6: data.filter6 || '', filter7: data.filter7 || '', filter8: data.filter8 || '', filter9: data.filter9 || '', filter10: data.filter10 || '',
            filter11: data.filter11 || '', filter12: data.filter12 || '', filter13: data.filter13 || '', filter14: data.filter14 || '', filter15: data.filter15 || '',
            stock: data.stock?.toString() || '0',
            heightMax: data.heightMax?.toString() || '', baseMax: data.baseMax?.toString() || '', heightMin: data.heightMin?.toString() || '', baseMin: data.baseMin?.toString() || '',
            assembly: data.assembly || '', contents: data.contents || '', artist: data.artist || '',
          })
        })
    }
  }, [productArticle])

  useEffect(() => {
    const cat = categories.find(c => c.id === form.categoryId)
    setSelectedCategory(cat || null)
  }, [form.categoryId, categories])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    setForm({ ...form, [target.name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...form,
      price: parseInt(form.price),
      oldPrice: form.oldPrice ? parseInt(form.oldPrice) : null,
      stock: parseInt(form.stock),
      heightMax: form.heightMax ? parseFloat(form.heightMax) : null,
      baseMax: form.baseMax ? parseFloat(form.baseMax) : null,
      heightMin: form.heightMin ? parseFloat(form.heightMin) : null,
      baseMin: form.baseMin ? parseFloat(form.baseMin) : null,
    }

    const url = productArticle
      ? `/api/admin/products/${productArticle}`
      : '/api/admin/products'
    const method = productArticle ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      router.push('/admin/products')
      router.refresh()
    } else {
      const error = await res.json()
      alert(error.error || 'Ошибка сохранения')
    }
    setLoading(false)
  }

  // Маппинг названий фильтров (по аналогии с filter1Name..filter5Name)
  const filterFields = [
    { name: 'filter1', label: selectedCategory?.filter1Name },
    { name: 'filter2', label: selectedCategory?.filter2Name },
    { name: 'filter3', label: selectedCategory?.filter3Name },
    { name: 'filter4', label: selectedCategory?.filter4Name },
    { name: 'filter5', label: selectedCategory?.filter5Name },
    { name: 'filter6', label: selectedCategory?.filter6Name },
    { name: 'filter7', label: selectedCategory?.filter7Name },
    { name: 'filter8', label: selectedCategory?.filter8Name },
    { name: 'filter9', label: selectedCategory?.filter9Name },
    { name: 'filter10', label: selectedCategory?.filter10Name },
    { name: 'filter11', label: selectedCategory?.filter11Name },
    { name: 'filter12', label: selectedCategory?.filter12Name },
    { name: 'filter13', label: selectedCategory?.filter13Name },
    { name: 'filter14', label: selectedCategory?.filter14Name },
    { name: 'filter15', label: selectedCategory?.filter15Name },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          {productArticle ? 'Редактировать товар' : 'Новый товар'}
        </h1>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-accent px-4 py-2 rounded-lg flex items-center gap-2 text-white">
            <Save size={18} /> {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-700 px-4 py-2 rounded-lg">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Основные поля (без изменений) */}
        <div>
          <label className="block text-white mb-1">Артикул*</label>
          <input name="article" value={form.article} onChange={handleChange} required disabled={!!productArticle} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white disabled:opacity-50" />
        </div>
        <div>
          <label className="block text-white mb-1">Название*</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Цена (₽)*</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Старая цена</label>
          <input name="oldPrice" type="number" value={form.oldPrice} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Категория*</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required className="w-full p-2 rounded bg-cardbg border border-borderLight text-white">
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Динамические фильтры (15 штук) */}
        {selectedCategory && filterFields.map(({ name, label }) => {
          if (!label) return null
          return (
            <div key={name}>
              <label className="block text-white mb-1">{label}</label>
              <input
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
              />
            </div>
          )
        })}

        {/* Остальные поля (размеры, сборка и т.д.) */}
        <div>
          <label className="block text-white mb-1">Количество</label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Высота самой большой модели (мм)</label>
          <input name="heightMax" type="number" step="0.1" value={form.heightMax} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">База самой большой модели (мм)</label>
          <input name="baseMax" type="number" step="0.1" value={form.baseMax} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Высота самой маленькой модели (мм)</label>
          <input name="heightMin" type="number" step="0.1" value={form.heightMin} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">База самой маленькой модели (мм)</label>
          <input name="baseMin" type="number" step="0.1" value={form.baseMin} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Сборка</label>
          <input name="assembly" value={form.assembly} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Комплектация (число моделей)</label>
          <input name="contents" value={form.contents} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Художник</label>
          <input name="artist" value={form.artist} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Масштаб</label>
          <input name="scale" value={form.scale} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>

        {/* Общие поля */}
        <div>
          <label className="block text-white mb-1">Теги (через запятую)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-white mb-1">Изображения (URL через запятую)</label>
          <input name="images" value={form.images} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white mb-1">Описание</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full p-2 rounded bg-cardbg border border-borderLight text-white" />
        </div>
      </div>
    </form>
  )
}