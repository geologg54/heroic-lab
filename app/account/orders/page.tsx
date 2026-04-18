// app/account/orders/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">История заказов</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">У вас пока нет заказов</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-cardbg rounded-xl border border-borderLight p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-white font-semibold">Заказ № {order.id.slice(-8)}</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{order.total} ₽</div>
                  <div className="text-sm text-gray-400">{order.status}</div>
                </div>
              </div>
              <div className="border-t border-borderLight pt-4">
                <div className="text-gray-400 text-sm mb-2">Состав заказа:</div>
                <ul className="space-y-1">
                  {order.items.map(item => (
                    <li key={item.id} className="text-gray-300">
                      {item.product.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              {order.address && (
                <div className="mt-4 text-sm text-gray-400">
                  Адрес доставки: {order.address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}