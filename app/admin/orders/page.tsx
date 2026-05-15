// app/admin/orders/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import OrdersFilterBar from '@/components/admin/OrdersFilterBar'
import OrdersBatchActions from '@/components/admin/OrdersBatchActions'
import OrdersTable from '@/components/admin/OrdersTable'

const STORAGE_KEY = 'admin_checked_order_items'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Фильтры
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Сортировка
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Массовые операции
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [batchStatus, setBatchStatus] = useState('')
  const [sendNotifications, setSendNotifications] = useState(false)
  const [applyingBatch, setApplyingBatch] = useState(false)

  // Отметки товаров
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isCheckedItemsLoaded, setIsCheckedItemsLoaded] = useState(false)

  // Загрузка отметок из localStorage
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

  // Сохранение отметок
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

  const selectableOrders = orders.filter(o => o.status === 'processing')

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === selectableOrders.length) {
      setSelectedOrderIds(new Set())
    } else {
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
        <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-white">Сбросить фильтры</button>
      </div>

      <OrdersFilterBar
        search={search} setSearch={setSearch}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        minTotal={minTotal} setMinTotal={setMinTotal}
        maxTotal={maxTotal} setMaxTotal={setMaxTotal}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        onApplyFilters={fetchOrders}
      />

      <OrdersBatchActions
        selectedOrderIds={selectedOrderIds}
        batchStatus={batchStatus} setBatchStatus={setBatchStatus}
        sendNotifications={sendNotifications} setSendNotifications={setSendNotifications}
        onApply={applyBatchAction}
        applyingBatch={applyingBatch}
        onCancel={() => setSelectedOrderIds(new Set())}
      />

      <OrdersTable
        orders={orders}
        selectedOrderIds={selectedOrderIds}
        toggleSelectAll={toggleSelectAll}
        toggleSelectOne={toggleSelectOne}
        checkedItems={checkedItems}
        onToggleItem={toggleItemCheck}
        handleStatusChange={handleStatusChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />
    </div>
  )
}