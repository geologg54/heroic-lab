// components/product/ProductSidebar.tsx
'use client';

import { useState } from 'react';
import { FavoritesButton } from '@/components/common/FavoritesButton';
import FaqModal from '@/components/product/FaqModal';
import { useCart } from '@/hooks/useCart';
import { useMaterial } from '@/components/product/MaterialProvider';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';

export default function ProductSidebar({ product }: { product: Product }) {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const { addToCart } = useCart();
  const { selectedMaterial, defaultMaterial, finalPrice, openModal } = useMaterial();

  const isMaterialChanged = defaultMaterial && selectedMaterial && selectedMaterial.id !== defaultMaterial.id;

  const handleAddToCart = () => {
    const options = isMaterialChanged
      ? { materialName: selectedMaterial.name, materialId: selectedMaterial.id }
      : undefined;
    addToCart(product, 1, options, finalPrice);
  };

  const specialOrderMsg = `Добрый день. Хочу обсудить с вами индивидуальный заказ.`;
  const scaleMsg = `Добрый день. Хочу заказать модель "${product.article}" "${product.name}" в другом масштабе.`;
  const questionMsg = `Добрый день. У меня возник вопрос о товаре "${product.article}" "${product.name}"`;

  return (
    <>
      <div className="pl-4 space-y-6">
        <div className="flex items-center gap-4">
          {/* Новая кнопка "В корзину" с ценой, как в мобильной версии, всегда плоская */}
          <button
  onClick={handleAddToCart}
  className="inline-flex items-center gap-2 bg-white text-darkbg font-bold text-lg px-5 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white transform hover:scale-105 transition-all duration-200"
>
  <ShoppingCart size={20} />
  <span className="inline-flex items-center gap-2 whitespace-nowrap">
    {product.oldPrice && (
      <span className="text-gray-400 line-through text-sm">{product.oldPrice} ₽</span>
    )}
    <span>{finalPrice} ₽</span>
  </span>
</button>
          <FavoritesButton productId={product.article} />
        </div>
        <div className="text-white space-y-2 text-lg">
          <button onClick={openModal} className="block hover:text-accent">Изменить материал</button>
          <Link href={`/contact?message=${encodeURIComponent(scaleMsg)}`} className="block hover:text-accent">Выбрать масштаб</Link>
          <Link href={`/contact?message=${encodeURIComponent(specialOrderMsg)}`} className="block hover:text-accent">Индивидуальный заказ</Link>
          <button onClick={() => setIsFaqOpen(true)} className="block hover:text-accent">Частые вопросы</button>
          <Link href={`/contact?message=${encodeURIComponent(questionMsg)}`} className="block hover:text-accent">Вопрос о товаре</Link>
        </div>
      </div>
      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </>
  );
}