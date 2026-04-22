// app/catalog/page.tsx
import { prisma } from '@/lib/prisma'
import CatalogContent from './CatalogContent'

// Отключаем кеширование на уровне Next.js, чтобы всегда получать свежие данные о категориях
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  // Получаем все категории из БД для построения фильтров
  const categoriesFromDb = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  })

  const categoryNames: Record<string, string> = {}
  categoriesFromDb.forEach(cat => {
    categoryNames[cat.slug] = cat.name
  })

  const categories = Object.keys(categoryNames)

  // Начальные опции фильтров — пустые, они будут заполнены на клиенте после первого запроса
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
      // Передаём пустые начальные данные — товары загрузятся на клиенте
      initialProducts={[]}
      initialTotal={0}
      initialPage={1}
      totalPages={0}
      categories={categories}
      allFilterOptions={allFilterOptions}
      categoryNames={categoryNames}
    />
  )
}