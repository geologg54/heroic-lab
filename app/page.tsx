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
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trenchProducts, setTrenchProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAllCategories(), fetchAllProducts()])
      .then(([cats, prods]) => {
        setCategories(cats)
        setFeaturedProducts(prods.slice(0, 4))
        
        const trench = prods.filter(p => {
          if (typeof p.category === 'object' && p.category !== null) {
            return p.category.slug === 'trench-crusade'
          }
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
      
      {/* Блок с баннерами вселенных – без заголовка, на всю ширину */}
      <section className="bg-[#071f30] py-12 px-4 md:px-6">
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