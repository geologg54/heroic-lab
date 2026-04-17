// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { HeroBanner } from '@/components/common/HeroBanner'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { CTASection } from '@/components/common/CTASection'
import { CollectionBlock } from '@/components/common/CollectionBlock'
import { fetchAllCategories, fetchAllProducts } from '@/lib/api'
import type { Category, Product } from '../types'

export default function HomePage() {
  // Явно указываем типы: categories — массив Category, products — массив Product
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trenchProducts, setTrenchProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // app/page.tsx (фрагмент внутри useEffect)
useEffect(() => {
  Promise.all([fetchAllCategories(), fetchAllProducts()])
    .then(([cats, prods]) => {
      setCategories(cats)
      setFeaturedProducts(prods.slice(0, 4))
      
      // Фильтруем товары категории Trench Crusade
      const trench = prods.filter(p => {
        // Если category - объект, проверяем slug
        if (typeof p.category === 'object' && p.category !== null) {
          return p.category.slug === 'trench-crusade'
        }
        // Иначе (если строка) сравниваем с categorySlug
        return p.categorySlug === 'trench-crusade'
      }).slice(0, 3)
      
      setTrenchProducts(trench)
      setLoading(false)
    })
    .catch(err => {
      console.error('Ошибка загрузки данных:', err)
      setLoading(false)
    })
}, [])

  if (loading) {
    return <div className="text-white text-center py-20">Загрузка...</div>
  }

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
            {categories.map((cat: any) => (
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