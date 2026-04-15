// app/product/[id]/page.tsx
import { notFound } from 'next/navigation'
import { products } from '@/lib/data'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartButton from '@/components/cart/AddToCartButton'
import { FavoritesButton } from '@/components/common/FavoritesButton'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductTabs } from '@/components/product/ProductTabs'
import { ProductMetadata } from '@/components/product/ProductMetadata'
import { StickyBuyBar } from '@/components/product/StickyBuyBar'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find(p => p.id === id)
  if (!product) notFound()

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/catalog' }, { label: product.category, href: `/category/${product.categorySlug}` }, { label: product.name }]} />
      
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
          {product.oldPrice && <div className="text-sm line-through text-gray-500">{product.oldPrice} ₽</div>}
          <p className="mt-4 text-gray-300">{product.shortDesc}</p>
          <div className="mt-6 flex gap-4">
            <AddToCartButton product={product} />
            <FavoritesButton productId={product.id} />
          </div>
          <div className="mt-6 p-4 bg-cardbg rounded-lg border border-borderLight">
            <p className="text-sm text-cyan-300">⚡ Цифровой товар. Ссылка на скачивание придет на email после оплаты.</p>
          </div>
        </div>
      </div>

      {/* Метаданные */}
      <ProductMetadata product={product} />

      {/* Табы */}
      <ProductTabs product={product} />

      {/* Похожие товары */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Похожие модели</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Sticky mobile bar */}
      <StickyBuyBar product={product} />
    </div>
  )
}