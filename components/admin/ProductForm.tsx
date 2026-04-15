// components/admin/ProductForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'

export const ProductForm = ({ productId }: { productId?: string }) => {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    categories: [] as string[],
    tags: '',
    gameSystem: '',
    faction: '',
    scale: '28mm',
    fileFormats: [] as string[],
    seoTitle: '',
    seoDesc: '',
    featured: false,
    status: 'draft'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Товар сохранён (демо)')
    router.push('/admin/products')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          {productId ? 'Редактировать товар' : 'Новый товар'}
        </h1>
        <div className="flex gap-2">
          <button type="submit" className="bg-accent px-4 py-2 rounded-lg flex items-center gap-2 text-white">
            <Save size={18} /> Сохранить
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-700 px-4 py-2 rounded-lg">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white mb-1">Название*</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white mb-1">Slug*</label>
          <input
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white mb-1">Описание</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Цена (₽)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Категория</label>
          <select className="w-full p-2 rounded bg-cardbg border border-borderLight text-white">
            <option>Космодесант</option>
            <option>Trench Crusade</option>
          </select>
        </div>
        <div>
          <label className="block text-white mb-1">Система</label>
          <input
            value={form.gameSystem}
            onChange={e => setForm({ ...form, gameSystem: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Фракция</label>
          <input
            value={form.faction}
            onChange={e => setForm({ ...form, faction: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Масштаб</label>
          <select
            value={form.scale}
            onChange={e => setForm({ ...form, scale: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          >
            <option>28mm</option>
            <option>32mm</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-white mb-1">SEO Заголовок</label>
          <input
            value={form.seoTitle}
            onChange={e => setForm({ ...form, seoTitle: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-white mb-1">SEO Описание</label>
          <textarea
            rows={2}
            value={form.seoDesc}
            onChange={e => setForm({ ...form, seoDesc: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
            />
            Рекомендуемый
          </label>
        </div>
        <div>
          <label className="block text-white mb-1">Статус</label>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full p-2 rounded bg-cardbg border border-borderLight text-white"
          >
            <option value="draft">Черновик</option>
            <option value="active">Опубликован</option>
          </select>
        </div>
      </div>

      <div className="border-t border-borderLight pt-6">
        <h3 className="text-white font-semibold mb-3">Загрузка файлов</h3>
        <div className="bg-cardbg p-4 rounded-lg space-y-2">
          <p className="text-gray-400">
            Превью изображение: <button type="button" className="text-accent">Загрузить</button>
          </p>
          <p className="text-gray-400">
            3D-модель (STL/OBJ): <button type="button" className="text-accent">Загрузить</button>
          </p>
        </div>
      </div>
    </form>
  )
}