// components/product/ProductSidebar.tsx
'use client';

export default function ProductSidebar({ product }: { product: any }) {
  return (
    <div className="pl-4 space-y-6">
      <button className="bg-white text-darkbg font-bold text-xl px-6 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white transition-colors">
        {product.price} ₽
      </button>
      <div className="text-white">Sidebar (без Fav)</div>
    </div>
  );
}