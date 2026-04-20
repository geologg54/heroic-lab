// components/admin/QuickActions.tsx
import Link from 'next/link'
import { Plus, Package, Users, FileText, Ticket } from 'lucide-react'

const actions = [
  { name: 'Новый товар', href: '/admin/products/new', icon: Plus, color: 'bg-accent' },
  { name: 'Все товары', href: '/admin/products', icon: Package, color: 'bg-blue-600' },
  { name: 'Пользователи', href: '/admin/users', icon: Users, color: 'bg-purple-600' },
  { name: 'Страницы', href: '/admin/pages', icon: FileText, color: 'bg-orange-600' },
  { name: 'Купоны', href: '/admin/coupons', icon: Ticket, color: 'bg-yellow-600' },
]

export const QuickActions = () => (
  <div className="mt-6 bg-cardbg border border-borderLight rounded-xl p-4">
    <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.map(action => (
        <Link
          key={action.name}
          href={action.href}
          className={`${action.color} hover:opacity-80 rounded-lg p-3 text-center transition flex flex-col items-center gap-2 text-white`}
        >
          <action.icon size={20} />
          <span className="text-xs">{action.name}</span>
        </Link>
      ))}
    </div>
  </div>
)