// components/admin/CouponsTable.tsx
'use client'
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface CouponsTableProps {
  coupons: any[]
  onEdit: (coupon: any) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, currentActive: boolean) => void
}

/**
 * Таблица купонов с действиями.
 */
export default function CouponsTable({ coupons, onEdit, onDelete, onToggleActive }: CouponsTableProps) {
  return (
    <div className="bg-cardbg border border-borderLight rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-b border-borderLight">
          <tr className="text-gray-400">
            <th className="p-3">Код</th>
            <th className="p-3">Скидка</th>
            <th className="p-3">Использовано</th>
            <th className="p-3">Срок действия</th>
            <th className="p-3">Статус</th>
            <th className="p-3 text-center">Действия</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="border-t border-borderLight">
              <td className="p-3 font-mono">{coupon.code}</td>
              <td className="p-3">{coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} ₽`}</td>
              <td className="p-3">
                {coupon.usedCount}
                {coupon.maxUses && ` / ${coupon.maxUses}`}
              </td>
              <td className="p-3">
                {coupon.validUntil
                  ? `до ${new Date(coupon.validUntil).toLocaleDateString()}`
                  : 'Бессрочно'}
              </td>
              <td className="p-3">
                <button
                  onClick={() => onToggleActive(coupon.id, coupon.isActive)}
                  className={coupon.isActive ? 'text-green-400' : 'text-red-400'}
                >
                  {coupon.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </button>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onEdit(coupon)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Редактировать"
                  >
                    <Edit size={20} className="text-accent" />
                  </button>
                  <button
                    onClick={() => onDelete(coupon.id)}
                    className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={20} className="text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}