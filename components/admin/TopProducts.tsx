// components/admin/TopProducts.tsx
const topProducts = [
  { name: 'Кровавый ангел – Капитан Терминатор', sales: 47, revenue: 23453 },
  { name: 'Траншейный спецназ «Морок»', sales: 38, revenue: 13262 },
  { name: 'Проклятый легионер – Чумной рыцарь', sales: 29, revenue: 17371 },
  { name: 'Древний красный дракон', sales: 21, revenue: 27279 },
  { name: 'Техножрец Доминус', sales: 18, revenue: 8082 },
]

export const TopProducts = () => (
  <div className="bg-cardbg border border-borderLight rounded-xl p-4">
    <h2 className="text-lg font-semibold text-white mb-4">Популярные товары</h2>
    <div className="space-y-3">
      {topProducts.map((product, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-white text-sm font-medium">{product.name}</div>
            <div className="text-gray-400 text-xs">{product.sales} продаж</div>
          </div>
          <div className="text-accent font-semibold">{product.revenue} ₽</div>
        </div>
      ))}
    </div>
  </div>
)