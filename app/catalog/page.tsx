// app/catalog/page.tsx
import { prisma } from '@/lib/prisma'
import CatalogContent from './CatalogContent'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function CatalogPage({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await searchParamsPromise;

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
    },
  })

  const categoryNames: Record<string, string> = {}
  categoriesFromDb.forEach((cat) => {
    categoryNames[cat.slug] = cat.name
  })
  const categories = Object.keys(categoryNames)

  const rawPage = searchParams?.page
  const page = typeof rawPage === 'string' ? parseInt(rawPage, 10) || 1 : 1
  const limit = 12

  const categorySlugs =
    typeof searchParams?.category === 'string'
      ? [searchParams.category]
      : []
  const tagVals =
    typeof searchParams?.tags === 'string' ? [searchParams.tags] : []
  const onSale = searchParams?.onSale === 'true'

  const where: any = {}
  if (categorySlugs.length > 0) {
    where.category = { slug: { in: categorySlugs } }
  }
  if (onSale) {
    where.oldPrice = { not: null }
  }
  if (tagVals.length > 0) {
    where.tags = { contains: tagVals[0] }
  }

  // Получаем общее количество, товары и крайние цены
  const [total, products, priceAgg] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
      where,
    }),
  ]);

  // Динамические границы цены
  const minPrice = priceAgg._min.price ?? 0;
  const maxPrice = priceAgg._max.price ?? 100;

  const formattedProducts = products.map((p) => ({
    ...p,
    images: p.images.split(',').filter(Boolean),
    tags: p.tags.split(',').map((t) => t.trim()).filter(Boolean),
    image: p.images.split(',')[0] || '',
    categorySlug: p.category.slug,
    categoryName: p.category.name,
  }))

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
      initialProducts={formattedProducts}
      initialTotal={total}
      initialPage={page}
      totalPages={Math.ceil(total / limit)}
      categories={categories}
      allFilterOptions={allFilterOptions}
      categoryNames={categoryNames}
      categoriesData={categoriesFromDb}
      minPrice={minPrice}   // <-- новое
      maxPrice={maxPrice}
    />
  )
}