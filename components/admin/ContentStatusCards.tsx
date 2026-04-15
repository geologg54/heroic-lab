// components/admin/ContentStatusCards.tsx
import { FileText, Image, Package, Layout } from 'lucide-react'

const cards = [
  { title: 'Всего товаров', value: '156', icon: Package, change: '+12', color: 'text-blue-400' },
  { title: 'Страницы', value: '8', icon: FileText, change: '0', color: 'text-green-400' },
  { title: 'Баннеры', value: '5', icon: Image, change: '+2', color: 'text-purple-400' },
  { title: 'Секции главной', value: '6', icon: Layout, change: '-1', color: 'text-orange-400' },
]

export const ContentStatusCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    {cards.map(card => (
      <div key={card.title} className="bg-cardbg border border-borderLight rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-gray-400 text-sm">{card.title}</div>
          <div className="text-2xl font-bold text-white">{card.value}</div>
          <div className="text-xs text-gray-500">изменение: {card.change}</div>
        </div>
        <card.icon className={card.color} size={32} />
      </div>
    ))}
  </div>
)