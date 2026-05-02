// app/account/coupons/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Ticket } from 'lucide-react';

export default function MyCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetch('/api/user/coupons')
      .then(res => res.json())
      .then(data => setCoupons(data.coupons || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return <div className="text-white text-center py-20">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Мои промокоды</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1">
          {coupons.length === 0 ? (
            <div className="bg-cardbg p-6 rounded-xl border border-borderLight text-center text-gray-400">
              <Ticket size={48} className="mx-auto mb-4 opacity-50" />
              <p>У вас пока нет доступных купонов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(uc => (
                <div key={uc.id} className="bg-cardbg border border-borderLight rounded-xl p-4">
                  <div className="text-2xl font-bold text-white mb-2">{uc.coupon.code}</div>
                  <p className="text-gray-300">
                    {uc.coupon.type === 'percent' ? `${uc.coupon.value}% скидка` : `Скидка ${uc.coupon.value} ₽`}
                  </p>
                  {uc.coupon.minOrderAmount && (
                    <p className="text-sm text-gray-400">Мин. заказ: {uc.coupon.minOrderAmount} ₽</p>
                  )}
                  {uc.coupon.validUntil && (
                    <p className="text-sm text-gray-400">
                      Действует до: {new Date(uc.coupon.validUntil).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Получен: {new Date(uc.assignedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}