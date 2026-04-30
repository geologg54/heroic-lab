// app/page.tsx
import { HeroBanner } from '@/components/common/HeroBanner'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ReviewsSection from '@/components/reviews/ReviewsSection'
import BannerImage from '@/components/common/BannerImage'

export default async function HomePage() {
  const categories = await prisma.category.findMany()

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

      {/* Баннер акции */}
      <section className="bg-darkbg py-10 px-4 md:px-6">
        <Link href="/catalog?onSale=true">
          <div className="relative w-full aspect-[900/300] rounded-xl overflow-hidden hover:opacity-90 transition-opacity">
            <BannerImage
              src="/images/banner/banner.png"
              alt="Акция"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </section>

      {/* Отзывы */}
      <ReviewsSection />

      {/* Блок "Остались вопросы?" */}
      <div className="bg-darkbg py-16 text-center border-t border-[#1e3a5f]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-3">Остались вопросы?</h2>
          <p className="text-gray-300 mb-6">Наша поддержка всегда рядом</p>
          <Link
            href="/contact"
            className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            Написать нам
          </Link>
        </div>
      </div>
    </div>
  )
}