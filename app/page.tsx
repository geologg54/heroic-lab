// app/page.tsx
import { HeroBanner } from '@/components/common/HeroBanner'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { CTASection } from '@/components/common/CTASection'
import { CollectionBlock } from '@/components/common/CollectionBlock'
import { prisma } from '@/lib/prisma'
import type { Category, Product } from '@/types'

// Вспомогательная функция форматирования товара
function formatProduct(p: any): Product {
  const images = p.images ? p.images.split(',') : []
  const tags = p.tags ? p.tags.split(',') : []
  return {
    article: p.article,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    image: images[0] || '',
    images,
    category: p.category,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    subcategory: null,
    description: p.description,
    shortDesc: null,
    filter1: p.filter1,
    filter2: p.filter2,
    filter3: p.filter3,
    filter4: p.filter4,
    filter5: p.filter5,
    stock: p.stock,
    heightMax: p.heightMax,
    baseMax: p.baseMax,
    heightMin: p.heightMin,
    baseMin: p.baseMin,
    assembly: p.assembly,
    contents: p.contents,
    artist: p.artist,
    scale: p.scale,
    tags,
    createdAt: p.createdAt?.toISOString() || null,
  } as Product
}

export default async function HomePage() {
  // Загружаем категории и все товары напрямую из БД
  const [categories, allProducts] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const products: Product[] = allProducts.map(formatProduct)

  // Товары для коллекции Trench Crusade
  const trenchProducts = products
    .filter(p => p.categorySlug === 'trench-crusade')
    .slice(0, 3)

  return (
    <div>
      <HeroBanner
        title="Героическая лаборатория миниатюр"
        subtitle="продаем кайф от настольных игр"
        ctaText="Каталог"
        ctaLink="/catalog"
        backgroundImage="/hero-bg.jpg"
      />

      {/* Блок с баннерами вселенных */}
      <section className="bg-darkbg py-12 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6">
          {categories.map((cat: any) => (
            <div key={cat.slug} className="flex-1">
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <CollectionBlock
          title="Коллекция «Траншейный кошмар»"
          subtitle="Миниатюры для Trench Crusade"
          link="/category/trench-crusade"
          products={trenchProducts}
        />
      </section>

      <CTASection
        title="Подпишитесь на рассылку"
        text="Получайте новинки и скидки на 3D-модели"
        buttonText="Подписаться"
      />
    </div>
  )
}