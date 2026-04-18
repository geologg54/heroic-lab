// app/catalog/page.tsx
import { fetchAllProducts } from '@/lib/api'
import CatalogContent from './CatalogContent'

export default async function CatalogPage() {
  const allProducts = await fetchAllProducts()
  const categories = [...new Set(allProducts.map(p => p.categorySlug))]

  return (
    <CatalogContent
      initialProducts={allProducts.slice(0, 12)}
      initialTotal={allProducts.length}
      initialPage={1}
      totalPages={Math.ceil(allProducts.length / 12)}
      categories={categories}
    />
  )
}