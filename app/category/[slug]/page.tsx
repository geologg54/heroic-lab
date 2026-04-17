// app/category/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getCategories, getProductsByCategorySlug } from '@/lib/db'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import CategoryProductsWrapper from '@/components/category/CategoryProductsWrapper'
import { Suspense } from 'react'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  const categories = await getCategories()
  const category = categories.find(c => c.slug === slug)
  if (!category) {
    notFound()
  }

  const products = await getProductsByCategorySlug(slug)

  const subcategories = [...new Set(products.filter(p => p.subcategory).map(p => p.subcategory))]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: category.name },
        ]}
      />

      <div className="relative rounded-xl overflow-hidden my-6 bg-gradient-to-r from-[#0a2a3f] to-[#05192C] p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
        <p className="text-gray-300 mt-2 max-w-2xl">
          Исследуйте {products.length} моделей в этой категории. Цифровые файлы для 3D печати.
        </p>
        {category.image && (
          <div className="absolute right-0 top-0 opacity-20">
            <img src={category.image} alt="" className="h-full object-cover" />
          </div>
        )}
      </div>

      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Подкатегории</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <a
                key={sub}
                href={`#${sub}`}
                className="px-4 py-2 bg-cardbg border border-borderLight rounded-full text-gray-300 hover:text-white hover:border-accent"
              >
                {sub}
              </a>
            ))}
          </div>
        </div>
      )}

      <Suspense fallback={<div className="text-white text-center py-10">Загрузка товаров...</div>}>
        <CategoryProductsWrapper products={products} />
      </Suspense>
    </div>
  )
}