// components/product/RelatedProducts.tsx
import Link from 'next/link'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { Product } from '@/types'
import type { RelatedFilterParams } from './ProductPageClient'

interface RelatedProductsProps {
  related: Product[];
  relatedFilterParams: RelatedFilterParams;
  categorySlug: string;
  currentArticle: string;
}

export default function RelatedProducts({ related, currentArticle }: RelatedProductsProps) {
  if (related.length === 0) return null;

  return (
    <section className="mt-12 mb-8 w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Похожие товары</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {related.slice(0, 3).map((p) => (
          <ProductCard key={p.article} product={p} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href={`/catalog?similarTo=${currentArticle}`}
          className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
        >
          Показать все похожие
        </Link>
      </div>
    </section>
  );
}