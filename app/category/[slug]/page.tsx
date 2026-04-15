// app/category/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { products, categories } from '@/lib/data'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { SortDropdown } from '@/components/catalog/SortDropdown'
import Pagination from '@/components/catalog/Pagination'
import { ActiveFilters } from '@/components/catalog/ActiveFilters'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categories.find(c => c.slug === slug)
  if (!category) notFound()
  
  const categoryProducts = products.filter(p => p.categorySlug === slug)
  // Подкатегории (уникальные subcategory)
  const subcategories = [...new Set(categoryProducts.filter(p => p.subcategory).map(p => p.subcategory))]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/catalog' }, { label: category.name }]} />
      
      {/* Hero блок категории */}
      <div className="relative rounded-xl overflow-hidden my-6 bg-gradient-to-r from-[#0a2a3f] to-[#05192C] p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
        <p className="text-gray-300 mt-2 max-w-2xl">Исследуйте {categoryProducts.length} моделей в этой категории. Цифровые файлы для 3D печати.</p>
        {category.image && <div className="absolute right-0 top-0 opacity-20"><img src={category.image} alt="" className="h-full object-cover" /></div>}
      </div>

      {/* Подкатегории */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Подкатегории</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map(sub => (
              <a key={sub} href={`#${sub}`} className="px-4 py-2 bg-cardbg border border-borderLight rounded-full text-gray-300 hover:text-white hover:border-accent">{sub}</a>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4"><FilterPanel products={categoryProducts} onFilter={() => {}} /></aside>
        <main className="lg:w-3/4">
          <div className="flex justify-between mb-4"><SortDropdown onSort={() => {}} products={[]} /><span className="text-gray-400">{categoryProducts.length} моделей</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination totalPages={1} currentPage={1} onPageChange={() => {}} />
        </main>
      </div>
    </div>
  )
}