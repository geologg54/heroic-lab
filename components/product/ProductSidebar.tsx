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

  const isMaterialChanged =
    defaultMaterial && selectedMaterial && selectedMaterial.id !== defaultMaterial.id;

  const handleAddToCart = () => {
    const options = isMaterialChanged
      ? { materialName: selectedMaterial.name, materialId: selectedMaterial.id }
      : undefined;
    addToCart(product, 1, options, finalPrice);
  };

  const specialOrderMsg = `Добрый день. Хочу обсудить с вами персональный заказ.`;
  const scaleMsg = `Добрый день. Хочу заказать модель "${product.article}" "${product.name}" в другом масштабе.`;
  const questionMsg = `Добрый день. У меня возник вопрос о товаре "${product.article}" "${product.name}"`;

  return (
    <>
      <div className="pl-4 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddToCart}
            className="bg-white text-darkbg font-bold text-xl px-6 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white active:bg-darkbg active:text-white focus:outline-none transition-colors duration-150"
          >
            <ShoppingCart size={20} className="inline-block mr-2" />
            <span className="flex flex-col items-start">
              {product.oldPrice && (
                <span className="text-gray-400 line-through text-xs">{product.oldPrice} ₽</span>
              )}
              <span>{finalPrice} ₽</span>
            </span>
          </button>
          <FavoritesButton productId={product.article} />
        </div>
        <div className="text-white space-y-2 text-lg">
          <button onClick={openModal} className="block hover:text-accent focus:outline-none transition">
            Изменить материал
          </button>
          <Link href={`/contact?message=${encodeURIComponent(scaleMsg)}`} className="block hover:text-accent transition">
            Выбрать масштаб
          </Link>
          <Link href={`/contact?message=${encodeURIComponent(specialOrderMsg)}`} className="block hover:text-accent transition">
            Персональный заказ
          </Link>
          <button onClick={() => setIsFaqOpen(true)} className="block hover:text-accent focus:outline-none transition">
            Частые вопросы
          </button>
          <Link href={`/contact?message=${encodeURIComponent(questionMsg)}`} className="block hover:text-accent transition">
            Вопрос о товаре
          </Link>
        </div>
      </div>
      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </>
  );
}