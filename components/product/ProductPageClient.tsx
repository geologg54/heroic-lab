// components/product/ProductPageClient.tsx
'use client';

import { useState } from 'react';
import { useMaterial } from '@/components/product/MaterialProvider';
import ProductGallery from '@/components/product/ProductGallery';
import MobileProductGallery from '@/components/product/MobileProductGallery';
import MobileActionPanel from '@/components/product/MobileActionPanel';
import { FavoritesButton } from '@/components/common/FavoritesButton';
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { ProductCard } from '@/components/catalog/ProductCard';
import { StickyBuyBar } from '@/components/product/StickyBuyBar';
import ProductSidebar from '@/components/product/ProductSidebar';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Settings } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Product } from '@/types';

interface ProductPageClientProps {
  product: Product;
  related: Product[];
  breadcrumbItems: { label: string; href?: string }[];
  showMinHeight: boolean;
}

export default function ProductPageClient({
  product,
  related,
  breadcrumbItems,
  showMinHeight,
}: ProductPageClientProps) {
  const { defaultMaterial, selectedMaterial, finalPrice } = useMaterial();
  const { addToCart } = useCart();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileAddToCart = () => {
    const isMaterialChanged =
      defaultMaterial && selectedMaterial && selectedMaterial.id !== defaultMaterial.id;
    const options = isMaterialChanged
      ? { materialName: selectedMaterial.name, materialId: selectedMaterial.id }
      : undefined;
    addToCart(product, 1, options, finalPrice);
  };

  const tagsFilterUrl = `/catalog?${product.tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&')}`;

  // --- Блок с названием товара (вынесли отдельно, чтобы можно было управлять его положением) ---
  const titleBlock = (
    <div className="min-h-[5rem] flex items-center justify-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
        {product.name}
      </h1>
    </div>
  );

  // --- Основной контент (размеры, характеристики, описание, похожие) – теперь без названия! ---
  const mainContent = (
    <>
      {/* Размеры */}
      <div className="mt-10 space-y-6 w-full">
        <h2 className="text-xl font-semibold text-white pb-3">Размеры</h2>
        {product.heightMax && (
          <div className="flex items-center">
            <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
              <Image src={product.images[0]} alt="" fill className="object-cover" />
            </div>
            <div className="relative w-[15%] aspect-square bg-transparent flex items-center justify-center flex-shrink-0">
              <Image src="/size-arrow.png" alt="" fill className="object-contain p-2" />
            </div>
            <span className="text-white text-sm md:text-lg leading-tight ml-2 pr-4">
              {product.heightMax} мм — самая высокая модель в наборе
            </span>
          </div>
        )}
        {showMinHeight && product.heightMin && (
          <div className="flex items-center">
            <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
              <Image src={product.images[1] || product.images[0]} alt="" fill className="object-cover" />
            </div>
            <div className="relative w-[15%] aspect-square bg-transparent flex items-center justify-center flex-shrink-0">
              <Image src="/size-arrow.png" alt="" fill className="object-contain p-2" />
            </div>
            <span className="text-white text-sm md:text-lg leading-tight ml-2 pr-4">
              {product.heightMin} мм — самая низкая модель в наборе
            </span>
          </div>
        )}
      </div>

      {/* Характеристики */}
      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Другие характеристики</h2>
        <ul className="space-y-3 text-gray-300 text-lg">
          <li><span className="font-medium text-white">Масштаб:</span> {product.scale}</li>
          <li>
            <span className="font-medium text-white">Материал:</span>{' '}
            {defaultMaterial?.name || 'Не указан'}
          </li>
          <li className="flex items-center gap-2">
            <span className="font-medium text-white">Цвет:</span>
            <Image src="/color-hd-grey.png" alt="Серый" width={20} height={20} className="inline-block" />
          </li>
          {product.assembly && (
            <li><span className="font-medium text-white">Сборка модели:</span> {product.assembly}</li>
          )}
          {product.artist && (
            <li><span className="font-medium text-white">Художник:</span> {product.artist}</li>
          )}
        </ul>
      </div>

      {/* Описание */}
      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Описание</h2>
        <div className="prose prose-invert text-gray-300 max-w-none text-lg">
          {product.description.split('\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {product.contents && (
        <div className="mt-10 w-full">
          <h2 className="text-xl font-semibold text-white pb-3 mb-4">Комплектация</h2>
          <p className="text-gray-300 text-lg">{product.contents}</p>
        </div>
      )}

      <div className="mt-10 w-full">
        <h2 className="text-xl font-semibold text-white pb-3 mb-4">Совет</h2>
        <p className="text-gray-300 text-lg">
          Рекомендуем приклеить к подставке, клей и краски не входят в комплект.
        </p>
      </div>

      {/* Похожие товары */}
      {related.length > 0 && (
        <section className="mt-16 mb-12 w-full">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Похожие товары</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto justify-items-center">
            {related.slice(0, 3).map((p) => (
              <ProductCard key={p.article} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={tagsFilterUrl}
              className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              Показать больше моделей
            </Link>
          </div>
        </section>
      )}
    </>
  );

  return (
    <div className="w-full bg-darkbg">
      {/* Мобильная галерея на всю ширину */}
      {isMobile && (
        <div className="relative z-10">
          <MobileProductGallery images={product.images} />
        </div>
      )}

      {/* Основной контейнер */}
      <div className={`${isMobile ? 'w-full px-4' : 'w-[75%] mx-auto'} relative`}>
        {/* Хлебные крошки (только десктоп) */}
        <div className="h-20 hidden lg:flex items-center relative z-20">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Градиентный фон */}
        <div className="absolute top-20 left-0 w-full h-[calc(100%-5rem)] pointer-events-none z-0">
          <div
            className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[40%] aspect-square rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, #57A6F9 70%, transparent 90%)',
              filter: 'blur(150px)',
            }}
          />
          <div
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[30%] aspect-square rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, #57A6F9 0%, transparent 70%)',
              filter: 'blur(400px)',
            }}
          />
        </div>

        {/* Десктопная галерея */}
        {!isMobile && (
          <div className="relative z-10">
            <ProductGallery images={product.images} />
          </div>
        )}

        {/* Мобильный блок с кнопками и тегами – ПЕРЕСТАВИЛИ НАЗВАНИЕ И ТЕГИ */}
        {isMobile && (
          <div className="relative mt-4 z-10 flex flex-col items-center">
            {/* Ряд кнопок: цена/корзина, избранное, настройки */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={handleMobileAddToCart}
                className="flex items-center gap-2 bg-white text-darkbg font-bold text-xl px-6 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white transition-colors"
              >
                <ShoppingCart size={20} />
                <span>{finalPrice} ₽</span>
              </button>
              <FavoritesButton productId={product.article} />
              {/* Кнопка настроек – привели к единому стилю (без обводки, меньше) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
                aria-label="Меню действий"
              >
                <Settings size={22} />
              </button>
            </div>

            {/* Название товара – переехало сюда, над тегами */}
            {titleBlock}

            {/* Теги теперь под названием */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {product.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/catalog?tags=${encodeURIComponent(tag)}`}
                  className="px-4 py-1 rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-darkbg transition-colors text-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Основной контент: на десктопе – с боковыми колонками, на мобильном – по центру */}
        {isMobile ? (
          <div className="relative mt-4 z-10 w-full">
            {mainContent}
          </div>
        ) : (
          <div className="relative mt-8 z-10">
            {/* Левая колонка – теги (десктоп) */}
            <div
              className="fixed z-30 hidden lg:block"
              style={{
                top: '61%',
                transform: 'translateY(-50%)',
                left: `max(1rem, calc((100vw - 75vw) / 2))`,
                width: `calc((75vw - 45vw) / 2 - 1rem)`,
              }}
            >
              <div className="pr-4">
                <h3 className="text-white font-semibold mb-3 text-lg text-right">Теги</h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {product.tags.map((tag, idx) => (
                    <Link
                      key={idx}
                      href={`/catalog?tags=${encodeURIComponent(tag)}`}
                      className="px-4 py-1 rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-darkbg transition-colors text-sm"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая колонка – сайдбар (десктоп) */}
            <div
              className="fixed z-30 hidden lg:block"
              style={{
                top: '65%',
                transform: 'translateY(-50%)',
                right: `max(1rem, calc((100vw - 75vw) / 2))`,
                width: `calc((75vw - 45vw) / 2 - 1rem)`,
              }}
            >
              <ProductSidebar product={product} />
            </div>

            {/* Центральный контент в сетке */}
            <div className="grid grid-cols-[1fr_45vw_1fr] gap-0">
              <div className="pr-8 hidden lg:block" />
              <div className="w-full">
                {/* На десктопе название идёт перед mainContent */}
                {titleBlock}
                {mainContent}
              </div>
              <div className="pl-8 hidden lg:block" />
            </div>
          </div>
        )}
      </div>

      {/* Липкая панель (мобилка) */}
      <StickyBuyBar product={product} finalPrice={finalPrice} />

      {/* Мобильная панель действий */}
      <MobileActionPanel
        product={product}
        open={mobileMenuOpen}
        onOpen={() => setMobileMenuOpen(true)}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}