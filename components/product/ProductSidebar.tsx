// components/product/ProductSidebar.tsx
'use client';

import { useState } from 'react';
import { FavoritesButton } from '@/components/common/FavoritesButton';
import FaqModal from '@/components/product/FaqModal';
import type { Product } from '@/types';

export default function ProductSidebar({ product }: { product: Product }) {
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  return (
    <>
      <div className="pl-4 space-y-6">
        <div className="flex items-center gap-4">
          <button className="bg-white text-darkbg font-bold text-xl px-6 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white transition-colors">
            {product.price} ₽
          </button>
          <FavoritesButton productId={product.article} />
        </div>
        <div className="text-white space-y-2 text-lg">
          <div className="cursor-pointer hover:text-accent transition">Выбрать материал</div>
          <div className="cursor-pointer hover:text-accent transition">Выбрать масштаб</div>
          <div className="cursor-pointer hover:text-accent transition">Особый заказ</div>
          <button
            onClick={() => setIsFaqOpen(true)}
            className="block hover:text-accent transition"
          >
            Частые вопросы
          </button>
        </div>
      </div>

      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </>
  );
}