// components/admin/OrdersTable.tsx
'use client'
import OrderRow from './OrderRow'

interface Order {
  id: string
  orderNumber: number
  items: any[]
  total: number
  status: string
  deliveryMethod: string | null
  comment: string | null
  createdAt: string
}

interface OrdersTableProps {
  orders: Order[]
  selectedOrderIds: Set<string>
  toggleSelectAll: () => void
  toggleSelectOne: (id: string) => void
  checkedItems: Set<string>
  onToggleItem: (orderId: string, article: string) => void
  handleStatusChange: (orderId: string, newStatus: string) => void
  sortBy: string
  sortOrder: string
  handleSort: (column: string) => void
}

export default function OrdersTable({
  orders,
  selectedOrderIds,
  toggleSelectAll,
  toggleSelectOne,
  checkedItems,
  onToggleItem,
  handleStatusChange,
  sortBy,
  sortOrder,
  handleSort,
}: OrdersTableProps) {
  const selectableOrders = orders.filter(o => o.status === 'processing')

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-left min-w-[1200px]">
        <thead className="border-b border-borderLight">
          <tr className="text-gray-400">
            <th className="p-3 w-10">
              <input
                type="checkbox"
                checked={selectableOrders.length > 0 && selectedOrderIds.size === selectableOrders.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-accent"
              />
            </th>
            <th className="p-3 cursor-pointer hover:text-white transition" onClick={() => handleSort('orderNumber')}>
              № заказа{renderSortIndicator('orderNumber')}
            </th>
            <th className="p-3">Заказ</th>
            <th className="p-3 text-center">Комментарий</th>
            <th className="p-3 cursor-pointer hover:text-white transition" onClick={() => handleSort('total')}>
              Сумма{renderSortIndicator('total')}
            </th>
            <th className="p-3 cursor-pointer hover:text-white transition" onClick={() => handleSort('status')}>
              Статус{renderSortIndicator('status')}
            </th>
            <th className="p-3">Доставка</th>
            <th className="p-3 cursor-pointer hover:text-white transition" onClick={() => handleSort('createdAt')}>
              Дата{renderSortIndicator('createdAt')}
            </th>
            <th className="p-3 text-center">Просмотр</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              isProcessing={order.status === 'processing'}
              selected={selectedOrderIds.has(order.id)}
              onToggleSelect={toggleSelectOne}
              checkedItems={checkedItems}
              onToggleItem={onToggleItem}
              handleStatusChange={handleStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}