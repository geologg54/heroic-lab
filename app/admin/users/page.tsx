'use client'
import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { Edit, Trash2, Eye } from 'lucide-react'

const usersData = [
  { id: '1', name: 'Иван Петров', email: 'ivan@example.com', role: 'customer', status: 'active', ordersCount: 3, registeredAt: '2025-01-15' },
  { id: '2', name: 'Елена Смирнова', email: 'elena@example.com', role: 'customer', status: 'active', ordersCount: 7, registeredAt: '2025-02-20' },
  { id: '3', name: 'Алексей Козлов', email: 'alex@example.com', role: 'admin', status: 'active', ordersCount: 0, registeredAt: '2025-01-05' },
  { id: '4', name: 'Мария Иванова', email: 'maria@example.com', role: 'customer', status: 'blocked', ordersCount: 2, registeredAt: '2025-03-10' },
  { id: '5', name: 'Дмитрий Соколов', email: 'dmitry@example.com', role: 'manager', status: 'active', ordersCount: 12, registeredAt: '2024-12-01' },
]

export default function UsersPage() {
  const [filtered, setFiltered] = useState(usersData)
  const handleSearch = (query: string) => {
    if (!query) setFiltered(usersData)
    else setFiltered(usersData.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.includes(query)))
  }

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Имя', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Роль', accessor: (u: any) => <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-purple-900 text-purple-300' : u.role === 'manager' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>{u.role === 'admin' ? 'Админ' : u.role === 'manager' ? 'Менеджер' : 'Покупатель'}</span> },
    { header: 'Статус', accessor: (u: any) => <span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{u.status === 'active' ? 'Активен' : 'Заблокирован'}</span> },
    { header: 'Заказов', accessor: 'ordersCount' },
    { header: 'Дата регистрации', accessor: 'registeredAt' },
    { header: '', accessor: (u: any) => <div className="flex gap-2"><button className="text-accent"><Eye size={16} /></button><button className="text-accent"><Edit size={16} /></button><button className="text-red-400"><Trash2 size={16} /></button></div> },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Пользователи</h1>
        <button className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white">+ Добавить</button>
      </div>
      <SearchFilter onSearch={handleSearch} placeholder="Поиск по имени или email" />
      <DataTable data={filtered} columns={columns} />
    </div>
  )
}