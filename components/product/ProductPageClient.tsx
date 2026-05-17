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
import ProductTagsGrouped from '@/components/product/ProductTagsGrouped';
import { useCart } from '@/hooks/useCart';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ShoppingCart, Settings } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types';

export interface RelatedFilterParams {
  tags: string[];
  filter1: string[];
  filter2: string[];
  filter3: string[];
  filter4: string[];
  filter5: string[];
  filter6?: string[];
  filter7?: string[];
  filter8?: string[];
  filter9?: string[];
  filter10?: string[];
  filter11?: string[];
  filter12?: string[];
  filter13?: string[];
  filter14?: string[];
  filter15?: string[];
}

interface ProductPageClientProps {
  product: Product;
  related: Product[];
  relatedFilterParams: RelatedFilterParams;
  breadcrumbItems: { label: string; href?: string }[];
  showMinHeight: boolean;
  filterConfig: any[];
}

export default function ProductPageClient({
  product,
  related,
  relatedFilterParams,
  breadcrumbItems,
  showMinHeight,
  filterConfig,
}: ProductPageClientProps) {
  const { defaultMaterial, selectedMaterial, finalPrice } = useMaterial();
  const { addToCart } = useCart();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const PANEL_OFFSET = '-75vh';
  const rightPanelStyle: React.CSSProperties = { top: '60%', marginTop: PANEL_OFFSET };

  const handleMobileAddToCart = () => {
    const isMaterialChanged = defaultMaterial && selectedMaterial && selectedMaterial.id !== defaultMaterial.id;
    const options = isMaterialChanged ? { materialName: selectedMaterial.name, materialId: selectedMaterial.id } : undefined;
    addToCart(product, 1, options, finalPrice);
  };

  const titleBlock = (
    <div className="min-h-[5rem] flex items-center justify-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white text-center">{product.name}</h1>
    </div>
  );

  return (
    <div className="w-full bg-darkbg">
      {isMobile && (
        <div className="relative z-10">
          <MobileProductGallery images={product.images} />
        </div>
      )}

      <div className={`${isMobile ? 'w-full px-4' : 'w-[75%] mx-auto'} relative`}>
        <div className="h-20 hidden lg:flex items-center relative z-20">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

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

        {!isMobile && (
          <div className="relative z-10">
            <ProductGallery images={product.images} />
          </div>
        )}

        {isMobile ? (
          <div className="relative mt-4 z-10 flex flex-col items-center">
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

            <div className="w-full mb-6">
              <ProductTagsGrouped product={product} filterConfig={filterConfig} />
            </div>

            <div className="w-full">
              <ProductInfo product={product} showMinHeight={showMinHeight} defaultMaterialName={defaultMaterial?.name} />
            </div>

            <RelatedProducts 
              related={related} 
              relatedFilterParams={relatedFilterParams} 
              categorySlug={product.categorySlug} 
              currentArticle={product.article}
            />
          </div>
        ) : (
          <div className="relative mt-8 z-10">
            <div className="grid grid-cols-[1fr_45vw_1fr] gap-0">
              {/* Левая колонка – без sticky */}
              <div className="pr-8 hidden lg:block">
                <ProductTagsGrouped product={product} filterConfig={filterConfig} />
              </div>

              <div className="w-full">
                {titleBlock}
                <ProductInfo product={product} showMinHeight={showMinHeight} defaultMaterialName={defaultMaterial?.name} />
              </div>

              <div className="pl-8 hidden lg:block">
                <div className="sticky" style={rightPanelStyle}>
                  <ProductSidebar product={product} />
                </div>
              </div>
            </div>

            <RelatedProducts 
              related={related} 
              relatedFilterParams={relatedFilterParams} 
              categorySlug={product.categorySlug} 
              currentArticle={product.article}
            />
          </div>
        )}
      </div>

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