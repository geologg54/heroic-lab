// components/admin/ReviewsTabs.tsx
'use client'

type Tab = 'pending' | 'approved' | 'rejected' | 'external'

interface ReviewsTabsProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

/**
 * Панель вкладок для переключения между статусами отзывов.
 */
export default function ReviewsTabs({ activeTab, onTabChange }: ReviewsTabsProps) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'На модерации' },
    { key: 'approved', label: 'Опубликованные' },
    { key: 'rejected', label: 'Отклонённые' },
    { key: 'external', label: 'Добавить внешний' },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm ${
            activeTab === tab.key
              ? 'bg-accent text-white'
              : 'bg-cardbg border border-borderLight text-gray-300 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}