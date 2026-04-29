// app/catalog/page.tsx
import { prisma } from '@/lib/prisma'
import CatalogContent from './CatalogContent'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  // Получаем категории с названиями фильтров
  const categoriesFromDb = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      filter1Name: true,
      filter2Name: true,
      filter3Name: true,
      filter4Name: true,
      filter5Name: true,
    }
  })

  const categoryNames: Record<string, string> = {}
  categoriesFromDb.forEach(cat => {
    categoryNames[cat.slug] = cat.name
  })
  const categories = Object.keys(categoryNames)

  const allFilterOptions = {
    categories: categories,
    filter1: [],
    filter2: [],
    filter3: [],
    filter4: [],
    filter5: [],
    scales: [],
  }

  return (
    <CatalogContent
      initialProducts={[]}
      initialTotal={0}
      initialPage={1}
      totalPages={0}
      categories={categories}
      allFilterOptions={allFilterOptions}
      categoryNames={categoryNames}
      categoriesData={categoriesFromDb}
    />
  )
}