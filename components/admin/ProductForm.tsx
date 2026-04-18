// components/admin/ProductForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

export const ProductForm = ({ productArticle }: { productArticle?: string }) => {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    article: '',
    name: '',
    price: '',
    oldPrice: '',
    description: '',
    images: '',
    categoryId: '',
    gameSystem: '',
    scale: '32mm',
    type: '',
    faction: '',
    fileFormat: 'STL',
    tags: '',
    inStock: true,
    featured: false
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
            gameSystem: data.gameSystem,
            scale: data.scale,
            type: data.type,
            faction: data.faction || '',
            fileFormat: data.fileFormat,
            tags: data.tags,
            inStock: data.inStock,
            featured: data.featured
          })
        })
    }
  }, [productArticle])

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
        <div>
          <label className="block text-white mb-1">Артикул*</label>
          <input
            name="article"
            value={form.article}
            onChange={handleChange}
            required
            disabled={!!productArticle}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Название*</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Цена (₽)*</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Старая цена</label>
          <input
            name="oldPrice"
            type="number"
            value={form.oldPrice}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Категория*</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          >
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white mb-1">Система</label>
          <input
            name="gameSystem"
            value={form.gameSystem}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Масштаб</label>
          <input
            name="scale"
            value={form.scale}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Тип</label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Фракция</label>
          <input
            name="faction"
            value={form.faction}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Формат файла</label>
          <input
            name="fileFormat"
            value={form.fileFormat}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Теги (через запятую)</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Изображения (URL через запятую)</label>
          <input
            name="images"
            value={form.images}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white mb-1">Описание</label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              name="inStock"
              checked={form.inStock}
              onChange={e => setForm({ ...form, inStock: e.target.checked })}
            />
            В наличии
          </label>
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
            />
            Рекомендуемый
          </label>
        </div>
      </div>
    </form>
  )
}