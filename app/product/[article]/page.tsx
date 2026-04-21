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
  const productCatSlug = typeof product.category === 'object' 
    ? product.category.slug 
    : product.categorySlug

  const related = allProducts
    .filter(p => {
      const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug
      return catSlug === productCatSlug && p.article !== product.article
    })
    .slice(0, 4)

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
          {/* Чипсы – оставляем только масштаб, можно добавить теги при желании */}
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="chip">{product.scale}</span>
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
          <div className="mt-4 text-3xl font-bold text-amber-400">{product.price} ₽</div>
          {product.oldPrice && (
            <div className="text-sm line-through text-gray-500">{product.oldPrice} ₽</div>
          )}
          <p className="mt-4 text-gray-300">
            {product.description.slice(0, 150) + '…'}
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

      {/* Блок с данными для напарника */}
      <div className="mt-8 p-6 bg-cardbg rounded-xl border border-borderLight">
        <h2 className="text-xl font-bold text-white mb-4">Данные для карточки (фронтенд)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Артикул:</span> {product.article}</div>
          <div><span className="text-gray-400">Название:</span> {product.name}</div>
          <div><span className="text-gray-400">Цена:</span> {product.price} ₽</div>
          <div><span className="text-gray-400">Старая цена:</span> {product.oldPrice ? `${product.oldPrice} ₽` : '—'}</div>
          <div><span className="text-gray-400">Количество (stock):</span> {product.stock}</div>
          <div><span className="text-gray-400">Высота самой большой модели (heightMax):</span> {product.heightMax ? `${product.heightMax} мм` : '—'}</div>
          <div><span className="text-gray-400">База самой большой модели (baseMax):</span> {product.baseMax ? `${product.baseMax} мм` : '—'}</div>
          <div><span className="text-gray-400">Высота самой маленькой модели (heightMin):</span> {product.heightMin ? `${product.heightMin} мм` : '—'}</div>
          <div><span className="text-gray-400">База самой маленькой модели (baseMin):</span> {product.baseMin ? `${product.baseMin} мм` : '—'}</div>
          <div><span className="text-gray-400">Масштаб (scale):</span> {product.scale}</div>
          <div><span className="text-gray-400">Сборка (assembly):</span> {product.assembly || '—'}</div>
          <div><span className="text-gray-400">Комплектация (contents):</span> {product.contents || '—'}</div>
          <div><span className="text-gray-400">Художник (artist):</span> {product.artist || '—'}</div>
          <div><span className="text-gray-400">Теги (tags):</span> {product.tags.join(', ')}</div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          ⚠️ Этот блок временный — напарник может использовать эти данные для вёрстки карточки.
        </p>
      </div>

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