// app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { QuickActions } from '@/components/admin/QuickActions'
import { NewNotificationsWidget } from '@/components/admin/NewNotificationsWidget'
import { NewOrdersWidget } from '@/components/admin/NewOrdersWidget'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/')
  }

  // Получаем общую статистику
  const [totalProducts, totalOrders, totalUsers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Дашборд</h1>
      
      {/* Карточки статистики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cardbg border border-borderLight rounded-xl p-4">
          <div className="text-gray-400">Товаров</div>
          <div className="text-2xl font-bold text-white">{totalProducts}</div>
        </div>
        <div className="bg-cardbg border border-borderLight rounded-xl p-4">
          <div className="text-gray-400">Заказов</div>
          <div className="text-2xl font-bold text-white">{totalOrders}</div>
        </div>
        <div className="bg-cardbg border border-borderLight rounded-xl p-4">
          <div className="text-gray-400">Пользователей</div>
          <div className="text-2xl font-bold text-white">{totalUsers}</div>
        </div>
        {/* Можно добавить четвёртую карточку, например, выручку */}
      </div>

      {/* Виджеты: уведомления и новые заказы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <NewNotificationsWidget />
        <NewOrdersWidget />
      </div>

      {/* Быстрые действия */}
      <QuickActions />
    </div>
  )
}