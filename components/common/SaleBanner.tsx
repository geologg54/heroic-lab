// components/common/SaleBanner.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SaleBannerProps {
  hasSales: boolean;
}

export default function SaleBanner({ hasSales }: SaleBannerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section className="bg-darkbg py-10">
      {hasSales ? (
        <Link href="/catalog?onSale=true" className="block relative w-full h-64 md:h-80 overflow-hidden">
          <img
            src={isMobile ? '/images/banner/banner_mob.png' : '/images/banner/banner.png'}
            alt="Акция"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Плавное затемнение сверху и снизу, как в HeroBanner */}
          <div className="absolute inset-0 bg-gradient-to-b from-darkbg via-transparent to-darkbg pointer-events-none" />
        </Link>
      ) : (
        <div className="container mx-auto px-4">
          <div className="relative w-full aspect-[900/300] rounded-xl overflow-hidden bg-cardbg border border-borderLight flex items-center justify-center text-gray-400 text-xl">
            Сейчас нет акций
          </div>
        </div>
      )}
    </section>
  );
}