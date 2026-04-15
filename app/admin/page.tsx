// app/admin/page.tsx (полный вариант)
import { StatsCards } from '@/components/admin/StatsCards'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { TopProducts } from '@/components/admin/TopProducts'
import { QuickActions } from '@/components/admin/QuickActions'
import { ContentStatusCards } from '@/components/admin/ContentStatusCards'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Дашборд</h1>
      <StatsCards />
      <ContentStatusCards />
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <RecentOrders />
        <TopProducts />
      </div>
      <QuickActions />
    </div>
  )
}