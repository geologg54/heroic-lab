// app/catalog/page.tsx
import { fetchAllProducts } from '@/lib/api'
import CatalogContent from './CatalogContent'

// === НАСТРОЙКИ КЕШИРОВАНИЯ ===
export const revalidate = 60
export const dynamic = 'force-static'

export default async function CatalogPage() {
  // Загружаем все товары
  const allProducts = await fetchAllProducts()
  const categories = [...new Set(allProducts.map(p => p.categorySlug))]

  // Вычисляем полный список всех возможных значений для каждого фильтра
  // Эти списки не будут меняться при выборе фильтров – они нужны, чтобы показывать все чекбоксы всегда
  const allFilterOptions = {
    categories: categories,
    filter1: [...new Set(allProducts.flatMap(p => (p.filter1 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter2: [...new Set(allProducts.flatMap(p => (p.filter2 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter3: [...new Set(allProducts.flatMap(p => (p.filter3 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter4: [...new Set(allProducts.flatMap(p => (p.filter4 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    filter5: [...new Set(allProducts.flatMap(p => (p.filter5 || '').split(',').map(s => s.trim()).filter(Boolean)))],
    scales: [...new Set(allProducts.flatMap(p => (p.scale || '').split(',').map(s => s.trim()).filter(Boolean)))],
    // Теги не включаем сюда, потому что они будут динамическими
  }

  return (
    <CatalogContent
      initialProducts={allProducts.slice(0, 12)}
      initialTotal={allProducts.length}
      initialPage={1}
      totalPages={Math.ceil(allProducts.length / 12)}
      categories={categories}
      allFilterOptions={allFilterOptions}  // <-- новое свойство
    />
  )
}