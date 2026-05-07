// components/product/ProductPageClient.tsx
'use client';

import { useState } from 'react';
import { useMaterial } from '@/components/product/MaterialProvider';
import ProductGallery from '@/components/product/ProductGallery';
import MobileProductGallery from '@/components/product/MobileProductGallery';
import MobileActionPanel from '@/components/product/MobileActionPanel';
import { FavoritesButton } from '@/components/common/FavoritesButton';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import ProductSidebar from '@/components/product/ProductSidebar';
import { StickyBuyBar } from '@/components/product/StickyBuyBar';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import { useCart } from '@/hooks/useCart';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ShoppingCart, Settings } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types';

interface RelatedFilterParams {
  tags: string[];
  filter1: string[];
  filter2: string[];
  filter3: string[];
  filter4: string[];
  filter5: string[];
}

interface ProductPageClientProps {
  product: Product;
  related: Product[];
  relatedFilterParams: RelatedFilterParams;
  breadcrumbItems: { label: string; href?: string }[];
  showMinHeight: boolean;
}

export default function ProductPageClient({
  product,
  related,
  relatedFilterParams,
  breadcrumbItems,
  showMinHeight,
}: ProductPageClientProps) {
  const { defaultMaterial, selectedMaterial, finalPrice } = useMaterial();
  const { addToCart } = useCart();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Отступы для панелей (без изменений)
  const PANEL_OFFSET = '-75vh';
  const leftPanelStyle: React.CSSProperties = { top: '60%', marginTop: PANEL_OFFSET };
  const rightPanelStyle: React.CSSProperties = { top: '60%', marginTop: PANEL_OFFSET };

  // Добавление в корзину (мобильная кнопка)
  const handleMobileAddToCart = () => {
    const isMaterialChanged = defaultMaterial && selectedMaterial && selectedMaterial.id !== defaultMaterial.id;
    const options = isMaterialChanged ? { materialName: selectedMaterial.name, materialId: selectedMaterial.id } : undefined;
    addToCart(product, 1, options, finalPrice);
  };

  // Заголовок
  const titleBlock = (
    <div className="min-h-[5rem] flex items-center justify-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white text-center">{product.name}</h1>
    </div>
  );

  return (
    <div className="w-full bg-darkbg">
      {/* Мобильная галерея */}
      {isMobile && (
        <div className="relative z-10">
          <MobileProductGallery images={product.images} />
        </div>
      )}

      <div className={`${isMobile ? 'w-full px-4' : 'w-[75%] mx-auto'} relative`}>
        {/* Хлебные крошки (десктоп) */}
        <div className="h-20 hidden lg:flex items-center relative z-20">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Градиентный фон */}
        <div className="absolute top-20 left-0 w-full h-[calc(100%-5rem)] pointer-events-none z-0">
          <div
            className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[40%] aspect-square rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, #57A6F9 70%, transparent 90%)', filter: 'blur(150px)' }}
          />
          <div
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[30%] aspect-square rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, #57A6F9 0%, transparent 70%)', filter: 'blur(400px)' }}
          />
        </div>

        {/* Десктопная галерея */}
        {!isMobile && (
          <div className="relative z-10">
            <ProductGallery images={product.images} />
          </div>
        )}

        {isMobile ? (
          /* ===== МОБИЛЬНАЯ ВЕРСИЯ ===== */
          <div className="relative mt-4 z-10 flex flex-col items-center">
            {/* Кнопка "В корзину" и меню */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={handleMobileAddToCart}
                className="flex items-center gap-2 bg-white text-darkbg font-bold text-xl px-6 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white active:bg-darkbg active:text-white focus:outline-none transition-colors duration-150"
              >
                <ShoppingCart size={20} />
                <span className="flex flex-col items-start">
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through text-xs">{product.oldPrice} ₽</span>
                  )}
                  <span>{finalPrice} ₽</span>
                </span>
              </button>
              <FavoritesButton productId={product.article} />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-full text-white hover:bg-white/10 active:bg-white/20 focus:outline-none transition-colors duration-150"
                aria-label="Меню действий"
              >
                <Settings size={22} />
              </button>
            </div>

            {titleBlock}

            {/* Теги */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {product.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/catalog?tags=${encodeURIComponent(tag)}`}
                  className="px-4 py-1 rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-darkbg active:bg-white active:text-darkbg focus:outline-none transition-colors duration-150 text-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Детальная информация */}
            <div className="w-full">
              <ProductInfo product={product} showMinHeight={showMinHeight} defaultMaterialName={defaultMaterial?.name} />
            </div>

            {/* Похожие товары */}
            <RelatedProducts related={related} relatedFilterParams={relatedFilterParams} categorySlug={product.categorySlug} />
          </div>
        ) : (
          /* ===== ДЕСКТОПНАЯ ВЕРСИЯ ===== */
          <div className="relative mt-8 z-10">
            <div className="grid grid-cols-[1fr_45vw_1fr] gap-0">
              {/* Левая колонка (теги) */}
              <div className="pr-8 hidden lg:block">
                <div className="sticky" style={leftPanelStyle}>
                  <h3 className="text-white font-semibold mb-3 text-lg text-right">Теги</h3>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {product.tags.map((tag, idx) => (
                      <Link
                        key={idx}
                        href={`/catalog?tags=${encodeURIComponent(tag)}`}
                        className="px-4 py-1 rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-darkbg active:bg-white active:text-darkbg focus:outline-none transition-colors duration-150 text-sm"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Центр (заголовок и информация) */}
              <div className="w-full">
                {titleBlock}
                <ProductInfo product={product} showMinHeight={showMinHeight} defaultMaterialName={defaultMaterial?.name} />
              </div>

              {/* Правая колонка (сайдбар) */}
              <div className="pl-8 hidden lg:block">
                <div className="sticky" style={rightPanelStyle}>
                  <ProductSidebar product={product} />
                </div>
              </div>
            </div>

            {/* Похожие товары */}
            <RelatedProducts related={related} relatedFilterParams={relatedFilterParams} categorySlug={product.categorySlug} />
          </div>
        )}
      </div>

      {/* Плавающая панель покупки (мобильная) */}
      <StickyBuyBar product={product} finalPrice={finalPrice} />
      <MobileActionPanel
        product={product}
        open={mobileMenuOpen}
        onOpen={() => setMobileMenuOpen(true)}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}