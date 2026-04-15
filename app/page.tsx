import { HeroBanner } from '@/components/common/HeroBanner'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { CTASection } from '@/components/common/CTASection'
import { CollectionBlock } from '@/components/common/CollectionBlock'
import { products, categories } from '@/lib/data'

export default function HomePage() {
  const featured = products.slice(0, 4)
  const newArrivals = products.slice(4, 8)

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
    <h2 className="text-3xl font-bold mb-8 text-white">Категории</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map(cat => {
        // Подсчёт реального количества товаров в категории
        const count = products.filter(p => p.categorySlug === cat.slug).length
        return <CategoryCard key={cat.slug} category={cat} count={count} />
      })}
    </div>
  </div>
</section>
      <section className="container mx-auto px-4 py-12">
        <CollectionBlock
          title="Коллекция «Траншейный кошмар»"
          subtitle="Модели для Trench Crusade"
          link="/category/trench-crusade"
          products={products.filter(p => p.gameSystem === 'Trench Crusade').slice(0, 3)}
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