// app/page.tsx
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
      {/* добавляем отрицательный верхний отступ -mt-20, чтобы прижать к шапке */}
      <div className="-mt-20">
        <HeroBanner
          title="Продаем кайф от настольных игр"
          subtitle="Миниатюры, базы, наборы"
          ctaText="Каталог"
          ctaLink="/catalog"
          backgroundImage="/hero-bg.jpg"
          mobileBackgroundImage="/hero-bg-mobile.jpg"
        />
      </div>
      
      <section className="bg-[#071f30] py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">Вселенные</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {categories.map(cat => (
              <div key={cat.slug} className="flex-1 max-w-2xl">
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-12">
        <CollectionBlock
          title="Миниатюры Thench crusade"
          subtitle="Ужасы альтернативной истории. По хорошей цене."
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