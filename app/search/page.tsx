// app/page.tsx
import { HeroBanner } from '@/components/common/HeroBanner'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { CTASection } from '@/components/common/CTASection'
import { CollectionBlock } from '@/components/common/CollectionBlock'
import { getCategories, getProducts } from '@/lib/db'

export default async function HomePage() {
  const categories = await getCategories()
  const allProducts = await getProducts()

  const featuredProducts = allProducts.slice(0, 4)
  const trenchProducts = allProducts
    .filter(p => p.categorySlug === 'trench-crusade')
    .slice(0, 3)

  return (
    <div>
      <HeroBanner
        title="Героическая лаборатория миниатюр"
        subtitle="Цифровые 3D-модели для ваших сражений"
        ctaText="Каталог"
        ctaLink="/catalog"
        backgroundImage="/hero-bg.jpg"
      />
      
      <section className="bg-[#071f30] py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">Вселенные</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {categories.map((cat) => (
              <div key={cat.slug} className="flex-1 max-w-2xl">
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-12">
        <CollectionBlock
          title="Коллекция «Траншейный кошмар»"
          subtitle="Модели для Trench Crusade"
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