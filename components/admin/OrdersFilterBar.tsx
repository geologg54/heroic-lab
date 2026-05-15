// components/admin/OrdersFilterBar.tsx
'use client'

interface OrdersFilterBarProps {
  search: string
  setSearch: (v: string) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  minTotal: string
  setMinTotal: (v: string) => void
  maxTotal: string
  setMaxTotal: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  onApplyFilters: () => void
}

export default function OrdersFilterBar({
  search, setSearch,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  minTotal, setMinTotal,
  maxTotal, setMaxTotal,
  statusFilter, setStatusFilter,
  onApplyFilters,
}: OrdersFilterBarProps) {
  return (
    <div className="bg-cardbg border border-borderLight rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Поиск (№ или email)</label>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Введите номер или email..." className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Дата с</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Дата по</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Сумма от</label>
          <input type="number" value={minTotal} onChange={(e) => setMinTotal(e.target.value)} placeholder="0" className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Сумма до</label>
          <input type="number" value={maxTotal} onChange={(e) => setMaxTotal(e.target.value)} placeholder="∞" className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Статус</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white">
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
        <button onClick={onApplyFilters} className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg text-white">Применить фильтры</button>
      </div>
    </div>
  )
}