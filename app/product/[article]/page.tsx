// app/product/[article]/page.tsx
import { notFound } from 'next/navigation'
import { getProductByArticle, getProducts } from '@/lib/db'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartButton from '@/components/cart/AddToCartButton'
import { FavoritesButton } from '@/components/common/FavoritesButton'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductTabs } from '@/components/product/ProductTabs'
import { ProductMetadata } from '@/components/product/ProductMetadata'
import { StickyBuyBar } from '@/components/product/StickyBuyBar'

interface ProductPageProps {
  params: Promise<{ article: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { article } = await params

  const product = await getProductByArticle(article)
  if (!product) {
    notFound()
  }

  const allProducts = await getProducts()
  const productCatSlug = product.categorySlug

  const related = allProducts
    .filter(p => p.categorySlug === productCatSlug && p.article !== product.article)
    .slice(0, 4)

  const categoryName = product.categoryName || (typeof product.category === 'string' ? product.category : '')

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: categoryName, href: `/category/${productCatSlug}` },
    { label: product.name },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Остальная разметка без изменений */}
    </div>
  )
}