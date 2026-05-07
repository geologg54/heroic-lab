// components/product/RelatedProducts.tsx
import Link from 'next/link'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { Product } from '@/types'

interface RelatedFilterParams {
  tags: string[]
  filter1: string[]
  filter2: string[]
  filter3: string[]
  filter4: string[]
  filter5: string[]
}

interface RelatedProductsProps {
  related: Product[]
  relatedFilterParams: RelatedFilterParams
  categorySlug: string
}

/**
 * Блок "Похожие товары" с кнопкой перехода в каталог.
 */
export default function RelatedProducts({ related, relatedFilterParams, categorySlug }: RelatedProductsProps) {
  // Функция построения URL для фильтрации (вынесена из ProductPageClient)
  const buildCatalogUrl = () => {
    const params = new URLSearchParams()
    params.set('category', categorySlug)
    relatedFilterParams.tags.forEach(tag => params.append('tags', tag))
    relatedFilterParams.filter1.forEach(v => params.append('filter1', v))
    relatedFilterParams.filter2.forEach(v => params.append('filter2', v))
    relatedFilterParams.filter3.forEach(v => params.append('filter3', v))
    relatedFilterParams.filter4.forEach(v => params.append('filter4', v))
    relatedFilterParams.filter5.forEach(v => params.append('filter5', v))
    return `/catalog?${params.toString()}`
  }

  if (related.length === 0) return null

  return (
    <section className="mt-12 mb-8 w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Похожие товары</h2>
      <div className="flex flex-col md:flex-row md:justify-center gap-6">
        {related.slice(0, 3).map((p) => (
          <div key={p.article} className="flex justify-center">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href={buildCatalogUrl()}
          className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
        >
          Показать больше моделей
        </Link>
      </div>
    </section>
  )
}