// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users)
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, role: newRole })
    })
    fetchUsers()
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Удалить пользователя?')) return
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    fetchUsers()
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Пользователи</h1>
      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Имя</th>
              <th className="p-3">Email</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Заказов</th>
              <th className="p-3">Дата регистрации</th>
              <th className="p-3 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-borderLight">
                <td className="p-3">{u.id.slice(-8)}</td>
                <td className="p-3">{u.name || '—'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="user">Покупатель</option>
                    <option value="admin">Админ</option>
                  </select>
                </td>
                <td className="p-3">{u.ordersCount}</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                      title="Удалить пользователя"
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