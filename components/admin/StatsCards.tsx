// components/admin/StatsCards.tsx
import { DollarSign, ShoppingBag, Users, Download } from 'lucide-react'

const cards = [
  { title: 'Выручка (мес)', value: '124 890 ₽', icon: DollarSign, change: '+12%' },
  { title: 'Заказы', value: '156', icon: ShoppingBag, change: '+8%' },
  { title: 'Новые пользователи', value: '42', icon: Users, change: '+5%' },
  { title: 'Скачивания', value: '2 340', icon: Download, change: '+23%' },
]

export const StatsCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {cards.map(card => (
      <div key={card.title} className="bg-cardbg border border-borderLight rounded-xl p-4">
        <div className="flex justify-between items-start">
          <card.icon className="text-accent" size={24} />
          <span className="text-green-400 text-sm">{card.change}</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white">{card.value}</div>
          <div className="text-gray-400 text-sm">{card.title}</div>
        </div>
      </div>
    ))}
  </div>
)