'use client'
import { useState } from 'react'
import Link from 'next/link'
import { products } from '@/lib/adminData'
import { DataTable } from '@/components/ui/DataTable'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { Plus, Edit, Trash2, MoreVertical } from 'lucide-react'

export default function ProductsPage() {
  const [filtered, setFiltered] = useState(products)
  const handleSearch = (query: string) => setFiltered(products.filter(p => p.title.toLowerCase().includes(query.toLowerCase())))

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Название', accessor: 'title' },
    { header: 'Цена', accessor: (p: any) => `${p.price} ₽` },
    { header: 'Категория', accessor: 'category' },
    { header: 'Статус', accessor: (p: any) => <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>{p.status === 'active' ? 'Активен' : 'Черновик'}</span> },
    { header: '', accessor: (p: any) => <div className="flex gap-2"><Link href={`/admin/products/${p.id}`}><Edit size={16} className="text-accent" /></Link><button><Trash2 size={16} className="text-red-400" /></button></div> },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-bold text-white">Товары</h1><Link href="/admin/products/new" className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"><Plus size={18} /> Создать</Link></div>
      <SearchFilter onSearch={handleSearch} placeholder="Поиск товаров..." />
      <DataTable data={filtered} columns={columns} />
    </div>
  )
}