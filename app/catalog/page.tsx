// app/catalog/page.tsx
import { fetchAllProducts } from '@/lib/api'
import CatalogContent from './CatalogContent'

// === НАСТРОЙКИ КЕШИРОВАНИЯ ===
// Указываем Next.js перегенерировать эту страницу не чаще чем раз в 60 секунд.
// Первый запрос создаст статическую версию, последующие 60 секунд она будет отдаваться из кеша.
export const revalidate = 60

// Явно указываем, что страница должна быть статической (будет сгенерирована при сборке и обновляться по revalidate)
export const dynamic = 'force-static'

export default async function CatalogPage() {
  // Загружаем все товары (этот вызов происходит при генерации страницы, не на каждый запрос)
  const allProducts = await fetchAllProducts()
  const categories = [...new Set(allProducts.map(p => p.categorySlug))]

  return (
    <CatalogContent
      initialProducts={allProducts.slice(0, 12)}
      initialTotal={allProducts.length}
      initialPage={1}
      totalPages={Math.ceil(allProducts.length / 12)}
      categories={categories}
    />
  )
}