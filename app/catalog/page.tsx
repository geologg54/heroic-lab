// app/catalog/page.tsx
import { fetchAllProducts } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import CatalogContent from './CatalogContent'

export const revalidate = 60
export const dynamic = 'force-static'

export default async function CatalogPage() {
  const allProducts = await fetchAllProducts()
  
  const categoriesFromDb = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  })
  
  const categoryNames: Record<string, string> = {}
  categoriesFromDb.forEach(cat => {
    categoryNames[cat.slug] = cat.name
  })
  
  const categories = Object.keys(categoryNames)

  const allFilterOptions = {
    categories: categories,
    filter1: [...new Set(allProducts.flatMap(p => (p.filter1 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter2: [...new Set(allProducts.flatMap(p => (p.filter2 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter3: [...new Set(allProducts.flatMap(p => (p.filter3 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter4: [...new Set(allProducts.flatMap(p => (p.filter4 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter5: [...new Set(allProducts.flatMap(p => (p.filter5 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    scales: [...new Set(allProducts.flatMap(p => (p.scale || '').split(',').map(s => s.trim()).filter(Boolean)))],
  }

  return (
    <CatalogContent
      initialProducts={allProducts.slice(0, 12)}
      initialTotal={allProducts.length}
      initialPage={1}
      totalPages={Math.ceil(allProducts.length / 12)}
      categories={categories}
      allFilterOptions={allFilterOptions}
      categoryNames={categoryNames}
    />
  )
}