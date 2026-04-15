'use client'
import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'
import Link from 'next/link'

const pagesData = [
  { id: '1', title: 'О нас', slug: 'about', status: 'published', updatedAt: '2025-04-01' },
  { id: '2', title: 'Доставка и оплата', slug: 'delivery', status: 'published', updatedAt: '2025-03-28' },
  { id: '3', title: 'Политика конфиденциальности', slug: 'privacy', status: 'published', updatedAt: '2025-03-15' },
  { id: '4', title: 'Правила использования', slug: 'terms', status: 'draft', updatedAt: '2025-04-10' },
  { id: '5', title: 'Контакты', slug: 'contacts', status: 'published', updatedAt: '2025-04-05' },
]

export default function PagesPage() {
  const [filtered, setFiltered] = useState(pagesData)
  const handleSearch = (query: string) => {
    if (!query) setFiltered(pagesData)
    else setFiltered(pagesData.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.slug.includes(query)))
  }

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Название', accessor: 'title' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Статус', accessor: (p: any) => <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{p.status === 'published' ? 'Опубликовано' : 'Черновик'}</span> },
    { header: 'Обновлено', accessor: 'updatedAt' },
    { header: '', accessor: (p: any) => <div className="flex gap-2"><Link href={`/pages/${p.slug}`} target="_blank"><Eye size={16} className="text-accent" /></Link><button className="text-accent"><Edit size={16} /></button><button className="text-red-400"><Trash2 size={16} /></button></div> },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Страницы</h1>
        <button className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"><Plus size={18} /> Создать страницу</button>
      </div>
      <SearchFilter onSearch={handleSearch} placeholder="Поиск страниц..." />
      <DataTable data={filtered} columns={columns} />
    </div>
  )
}