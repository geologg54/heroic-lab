// app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { QuickActions } from '@/components/admin/QuickActions'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/')
  }

  const [totalProducts, totalOrders, totalUsers, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Дашборд</h1>
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
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Последние заказы</h2>
        <div className="bg-cardbg border border-borderLight rounded-xl p-4 overflow-x-auto">
          {recentOrders.length === 0 ? (
            <p className="text-gray-400">Заказов пока нет</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400">
                  <th className="pb-2">ID</th>
                  <th>Покупатель</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-t border-borderLight">
                    <td className="py-2">{order.id.slice(-8)}</td>
                    <td>{order.user.name || order.user.email}</td>
                    <td>{order.total} ₽</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <QuickActions />
    </div>
  )
}