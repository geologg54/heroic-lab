'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Package, FolderTree, Layout, Image, 
  Library, ShoppingCart, Users, FileText, MessageCircle, X,
  Ticket, Settings // 🆕 импорт иконки для купонов
} from 'lucide-react'

const menu = [
  { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { name: 'Категории', href: '/admin/categories', icon: FolderTree },
  { name: 'Купоны', href: '/admin/coupons', icon: Ticket }, // 🆕 пункт меню
  { name: 'Главная страница', href: '/admin/homepage', icon: Layout },
  { name: 'Баннеры', href: '/admin/banners', icon: Image },
  { name: 'Медиатека', href: '/admin/media', icon: Library },
  { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Пользователи', href: '/admin/users', icon: Users },
  { name: 'Страницы', href: '/admin/pages', icon: FileText },
  { name: 'Чат поддержки', href: '/admin/support', icon: MessageCircle },
  { name: 'Настройки', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <div className="h-full bg-[#0a1a2f] border-r border-[#1e3a5f] flex flex-col">
      <div className="p-4 border-b border-[#1e3a5f] flex justify-between items-center">
        <div className="text-white text-xl font-bold">Героическая лаборатория</div>
        <button onClick={onClose} className="lg:hidden text-gray-400"><X /></button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${isActive ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/5'}`}>
              <item.icon size={20} /> {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block w-64 fixed inset-y-0">{SidebarContent()}</div>
      {isOpen && <div className="fixed inset-0 bg-black/70 z-50 lg:hidden" onClick={onClose}><div className="w-64 h-full" onClick={e => e.stopPropagation()}>{SidebarContent()}</div></div>}
    </>
  )
}