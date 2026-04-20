// app/admin/orders/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye } from 'lucide-react'
import Link from 'next/link'

// Ключ для хранения отметок в localStorage
const STORAGE_KEY = 'admin_checked_order_items'

// Функция для форматирования состава заказа в виде вертикального списка с отметками
function renderOrderItems(
  order: any,
  checkedItems: Set<string>,
  onToggle: (orderId: string, article: string) => void
) {
  return (
    <div className="space-y-1 text-sm">
      {order.items.map((item: any) => {
        const name = item.product.name
        const qty = item.quantity
        const article = item.product.article
        const key = `${order.id}:${article}`
        const isChecked = checkedItems.has(key)

        return (
          <div key={item.id} className="flex items-center gap-1 leading-tight">
            <button
              onClick={() => onToggle(order.id, article)}
              className={`text-left hover:text-accent transition ${isChecked ? 'opacity-35' : ''}`}
              title={isChecked ? 'Собрано' : 'Отметить как собранное'}
            >
              {qty > 1 ? `${name} ×${qty}` : name}
            </button>
            {isChecked && (
              <span className="text-green-500 text-lg leading-none ml-1" title="Отмечено">✓</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Функция для отображения читаемого названия способа доставки
function getDeliveryLabel(method: string | null): string {
  if (!method) return '—'
  const labels: Record<string, string> = {
    'СДЭК': 'СДЭК',
    'Почта России': 'Почта России',
    'Самовывоз': 'Самовывоз'
  }
  return labels[method] || method
}

// Цвета статусов
function getStatusColor(status: string): string {
  switch (status) {
    case 'processing':
      return 'text-yellow-400'
    case 'cancelled':
      return 'text-red-400'
    case 'in_delivery':
    case 'shipped':
    case 'delivered':
      return 'text-green-400'
    default:
      return 'text-white'
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // --- Состояния фильтров ---
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // --- Состояния сортировки ---
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // --- Массовые операции ---
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [batchStatus, setBatchStatus] = useState('')
  const [sendNotifications, setSendNotifications] = useState(false)
  const [applyingBatch, setApplyingBatch] = useState(false)

  // --- Отметки товаров внутри заказов ---
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isCheckedItemsLoaded, setIsCheckedItemsLoaded] = useState(false)

  // Загружаем отметки из localStorage при монтировании
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setCheckedItems(new Set(parsed))
      }
    } catch (e) {
      console.error('Ошибка загрузки отметок из localStorage:', e)
    } finally {
      setIsCheckedItemsLoaded(true)
    }
  }, [])

  // Сохраняем отметки в localStorage при каждом изменении
  useEffect(() => {
    if (!isCheckedItemsLoaded) return
    try {
      const array = Array.from(checkedItems)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array))
    } catch (e) {
      console.error('Ошибка сохранения отметок в localStorage:', e)
    }
  }, [checkedItems, isCheckedItemsLoaded])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (minTotal) params.set('minTotal', minTotal)
      if (maxTotal) params.set('maxTotal', maxTotal)
      if (statusFilter) params.set('status', statusFilter)
      if (sortBy) params.set('sortBy', sortBy)
      if (sortOrder) params.set('order', sortOrder)

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setSelectedOrderIds(new Set())
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
    } finally {
      setLoading(false)
    }
  }, [search, dateFrom, dateTo, minTotal, maxTotal, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus })
    })
    fetchOrders()
  }

  // Получить список заказов, доступных для массового выбора (только "в обработке")
  const selectableOrders = orders.filter(o => o.status === 'processing')

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === selectableOrders.length) {
      // Снимаем выделение со всех
      setSelectedOrderIds(new Set())
    } else {
      // Выделяем все заказы в обработке
      setSelectedOrderIds(new Set(selectableOrders.map(o => o.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    const newSet = new Set(selectedOrderIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedOrderIds(newSet)
  }

  const applyBatchAction = async () => {
    if (selectedOrderIds.size === 0) {
      alert('Выберите хотя бы один заказ')
      return
    }
    if (!batchStatus) {
      alert('Выберите новый статус')
      return
    }

    setApplyingBatch(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrderIds),
          newStatus: batchStatus,
          sendNotifications
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Обновлено ${data.updatedCount} заказов`)
        setSelectedOrderIds(new Set())
        setBatchStatus('')
        setSendNotifications(false)
        fetchOrders()
      } else {
        alert(data.error || 'Ошибка')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setApplyingBatch(false)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setMinTotal('')
    setMaxTotal('')
    setStatusFilter('')
  }

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? ' ▲' : ' ▼'
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const toggleItemCheck = (orderId: string, productArticle: string) => {
    const key = `${orderId}:${productArticle}`
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Заказы</h1>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-400 hover:text-white"
        >
          Сбросить фильтры
        </button>
      </div>

      {/* Панель фильтров */}
      <div className="bg-cardbg border border-borderLight rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Поиск (№ или email)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Введите номер или email..."
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Дата с</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Дата по</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Сумма от</label>
            <input
              type="number"
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              placeholder="0"
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Сумма до</label>
            <input
              type="number"
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
              placeholder="∞"
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
            >
              <option value="">Все статусы</option>
              <option value="processing">В обработке</option>
              <option value="in_delivery">Передано в доставку</option>
              <option value="shipped">Отправлен</option>
              <option value="delivered">Доставлен</option>
              <option value="cancelled">Отменён</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={fetchOrders}
            className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white"
          >
            Применить фильтры
          </button>
        </div>
      </div>

      {/* Панель массовых операций */}
      {selectedOrderIds.size > 0 && (
        <div className="bg-cardbg border border-borderLight rounded-lg p-4 mb-4 flex flex-wrap items-center gap-4">
          <span className="text-white">
            Выбрано заказов: <strong>{selectedOrderIds.size}</strong>
          </span>
          <select
            value={batchStatus}
            onChange={(e) => setBatchStatus(e.target.value)}
            className="bg-[#0f2a42] border border-borderLight rounded px-3 py-2 text-white"
          >
            <option value="">Выберите новый статус...</option>
            <option value="processing">В обработке</option>
            <option value="in_delivery">Передано в доставку</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменён</option>
          </select>
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={sendNotifications}
              onChange={(e) => setSendNotifications(e.target.checked)}
            />
            Отправить уведомления покупателям
          </label>
          <button
            onClick={applyBatchAction}
            disabled={applyingBatch}
            className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
          >
            {applyingBatch ? 'Применение...' : 'Применить'}
          </button>
          <button
            onClick={() => setSelectedOrderIds(new Set())}
            className="text-gray-400 hover:text-white"
          >
            Отмена
          </button>
        </div>
      )}

      {/* Таблица заказов */}
      <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="border-b border-borderLight">
            <tr className="text-gray-400">
              <th className="p-3 w-10">
                {/* Чекбокс "выбрать все" показываем всегда, но работает только для processing */}
                <input
                  type="checkbox"
                  checked={selectableOrders.length > 0 && selectedOrderIds.size === selectableOrders.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-accent"
                />
              </th>
              <th 
                className="p-3 cursor-pointer hover:text-white transition"
                onClick={() => handleSort('orderNumber')}
              >
                № заказа{renderSortIndicator('orderNumber')}
              </th>
              <th className="p-3">Заказ</th>
              <th className="p-3 text-center">Комментарий</th>
              <th 
                className="p-3 cursor-pointer hover:text-white transition"
                onClick={() => handleSort('total')}
              >
                Сумма{renderSortIndicator('total')}
              </th>
              <th 
                className="p-3 cursor-pointer hover:text-white transition"
                onClick={() => handleSort('status')}
              >
                Статус{renderSortIndicator('status')}
              </th>
              <th className="p-3">Доставка</th>
              <th 
                className="p-3 cursor-pointer hover:text-white transition"
                onClick={() => handleSort('createdAt')}
              >
                Дата{renderSortIndicator('createdAt')}
              </th>
              <th className="p-3 text-center">Просмотр</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const isProcessing = order.status === 'processing'
              return (
                <tr key={order.id} className="border-t border-borderLight">
                  <td className="p-3">
                    {isProcessing ? (
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        className="w-4 h-4 accent-accent"
                      />
                    ) : (
                      // Пустая ячейка для не-processing заказов
                      <span className="w-4 h-4 inline-block" />
                    )}
                  </td>
                  <td className="p-3 font-mono">{order.orderNumber}</td>
                  <td className="p-3 align-top">
                    {renderOrderItems(order, checkedItems, toggleItemCheck)}
                  </td>
                  <td className="p-3 text-center align-middle">
                    {order.comment ? (
                      <span title={order.comment} className="cursor-help text-lg">
                        💬
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-3 align-middle">{order.total} ₽</td>
                  <td className="p-3 align-middle">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm ${getStatusColor(order.status)}`}
                    >
                      <option value="processing" className="text-yellow-400">В обработке</option>
                      <option value="in_delivery" className="text-green-400">Передано в доставку</option>
                      <option value="shipped" className="text-green-400">Отправлен</option>
                      <option value="delivered" className="text-green-400">Доставлен</option>
                      <option value="cancelled" className="text-red-400">Отменён</option>
                    </select>
                  </td>
                  <td className="p-3 text-sm align-middle">
                    {getDeliveryLabel(order.deliveryMethod)}
                  </td>
                  <td className="p-3 align-middle">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 align-middle">
                    <div className="flex justify-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Просмотреть заказ"
                      >
                        <Eye size={20} className="text-accent" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}