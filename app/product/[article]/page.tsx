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

  // Получаем товар по артикулу
  const product = await getProductByArticle(article)
  if (!product) {
    notFound()
  }

  // Получаем все товары для блока "Похожие модели"
  const allProducts = await getProducts()
  const productCatSlug = typeof product.category === 'object' 
    ? product.category.slug 
    : product.categorySlug

  const related = allProducts
    .filter(p => {
      const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
      return catSlug === productCatSlug && p.article !== product.article
    })
    .slice(0, 4)

  // Хлебные крошки
  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : product.categoryName || product.category

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: categoryName, href: `/category/${productCatSlug}` },
    { label: product.name },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <ProductGallery images={product.images} />
        <div>
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="chip">{product.gameSystem}</span>
            <span className="chip">{product.scale}</span>
            <span className="chip">{product.type}</span>
          </div>
          <div className="mt-4 text-3xl font-bold text-amber-400">{product.price} ₽</div>
          {product.oldPrice && (
            <div className="text-sm line-through text-gray-500">{product.oldPrice} ₽</div>
          )}
          <p className="mt-4 text-gray-300">
            {product.shortDesc || product.description.slice(0, 150) + '…'}
          </p>
          <div className="mt-6 flex gap-4">
            <AddToCartButton product={product} />
            <FavoritesButton productId={product.article} />
          </div>
          <div className="mt-6 p-4 bg-cardbg rounded-lg border border-borderLight">
            <p className="text-sm text-cyan-300">
              🚚 Доставка по всей России. Срок изготовления: 2-3 дня.
            </p>
          </div>
        </div>
      </div>

      <ProductMetadata product={product} />
      <ProductTabs product={product} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Похожие модели</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => (
              <ProductCard key={p.article} product={p} />
            ))}
          </div>
        </section>
      )}

      <StickyBuyBar product={product} />
    </div>
  )
}