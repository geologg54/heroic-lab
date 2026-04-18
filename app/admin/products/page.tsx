// app/admin/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products)
        setLoading(false)
      })
  }, [])

  const handleDelete = async (article: string) => {
    if (!confirm('Удалить товар?')) return
    await fetch(`/api/admin/products/${article}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.article !== article))
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Товары</h1>
        <Link
          href="/admin/products/new"
          className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Plus size={18} /> Создать
        </Link>
      </div>
      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">Артикул</th>
              <th className="p-3">Название</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Категория</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.article} className="border-t border-borderLight">
                <td className="p-3">{p.article}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price} ₽</td>
                <td className="p-3">{p.category?.name || '—'}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/products/${p.article}`}>
                    <Edit size={16} className="text-accent" />
                  </Link>
                  <button onClick={() => handleDelete(p.article)}>
                    <Trash2 size={16} className="text-red-400" />
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