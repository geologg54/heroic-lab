// app/product/[article]/page.tsx
import { notFound } from 'next/navigation'
import { getProductByArticle, getProducts } from '@/lib/db'
import ProductGallery from '@/components/product/ProductGallery'
import AddToCartButton from '@/components/cart/AddToCartButton'
import { FavoritesButton } from '@/components/common/FavoritesButton'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ProductCard } from '@/components/catalog/ProductCard'
import { StickyBuyBar } from '@/components/product/StickyBuyBar'
import Image from 'next/image'
import Link from 'next/link' // <-- Добавлен импорт Link

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
    .slice(0, 3)

  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : product.categoryName || product.category

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: categoryName, href: `/category/${productCatSlug}` },
    { label: product.name },
  ]

  // Определяем, показывать ли блок с минимальной высотой (только если stock > 1)
  const showMinHeight = product.stock > 1 && product.heightMin != null

  return (
    <div className="w-full bg-darkbg">
      {/* Широкий контейнер 75% */}
      <div className="w-[75%] mx-auto relative">
        {/* Хлебные крошки */}
        <div className="h-20 flex items-center relative z-20">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Фоновое свечение позади галереи */}
        <div className="absolute top-20 left-0 w-full h-[calc(100%-5rem)] pointer-events-none z-0">
          <div 
            className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[40%] aspect-square rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, #57A6F9 70%, transparent 90%)',
              filter: 'blur(150px)',
            }}
          />
          <div 
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[30%] aspect-square rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, #57A6F9 0%, transparent 70%)',
              filter: 'blur(400px)',
            }}
          />
        </div>

        {/* Галерея */}
        <div className="relative z-10">
          <ProductGallery images={product.images} />
        </div>

        {/* Основная сетка с фиксированными боковыми блоками */}
        <div className="relative mt-8 z-10">
          {/* Фиксированный левый блок (Теги) – ТЕПЕРЬ С ССЫЛКАМИ */}
          <div 
            className="fixed z-30 hidden lg:block"
            style={{ 
              top: '61%',
              transform: 'translateY(-50%)',
              left: `max(1rem, calc((100vw - 75vw) / 2))`,
              width: `calc((75vw - 45vw) / 2 - 1rem)`
            }}
          >
            <div className="pr-4">
              <h3 className="text-white font-semibold mb-3 text-lg text-right">Теги</h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {product.tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/catalog?tags=${encodeURIComponent(tag)}`}
                    className="px-4 py-1 rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-darkbg transition-colors text-sm"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Фиксированный правый блок (Цена и ссылки) */}
          <div 
            className="fixed z-30 hidden lg:block"
            style={{ 
              top: '65%',
              transform: 'translateY(-50%)',
              right: `max(1rem, calc((100vw - 75vw) / 2))`,
              width: `calc((75vw - 45vw) / 2 - 1rem)`
            }}
          >
            <div className="pl-4 space-y-6">
              <div className="flex items-center gap-4">
                <button className="bg-white text-darkbg font-bold text-xl px-6 py-3 rounded-lg border-2 border-white hover:bg-darkbg hover:text-white transition-colors">
                  {product.price} ₽
                </button>
                <FavoritesButton productId={product.article} />
              </div>
              <div className="text-white space-y-2 text-lg">
                <div className="cursor-pointer hover:text-accent transition">Выбрать материал</div>
                <div className="cursor-pointer hover:text-accent transition">Выбрать масштаб</div>
                <div className="cursor-pointer hover:text-accent transition">Особый заказ</div>
                <Link href="/faq" className="block hover:text-accent transition">Частые вопросы</Link>
              </div>
            </div>
          </div>

          {/* Сетка с плейсхолдерами для сохранения ширины */}
          <div className="grid grid-cols-[1fr_45vw_1fr] gap-0">
            <div className="pr-8 hidden lg:block" />
            
            <div className="w-full">
              <div className="min-h-[5rem] flex items-center justify-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center">{product.name}</h1>
              </div>

              <div className="lg:hidden flex flex-wrap items-center gap-4 mt-4">
                <div className="text-3xl font-bold text-amber-400">{product.price} ₽</div>
                {product.oldPrice && (
                  <div className="text-sm line-through text-gray-500">{product.oldPrice} ₽</div>
                )}
                <div className="flex gap-4 ml-auto">
                  <AddToCartButton product={product} />
                  <FavoritesButton productId={product.article} />
                </div>
              </div>

              {/* Размеры */}
              <div className="mt-10 space-y-6">
                <h2 className="text-xl font-semibold text-white pb-3">Размеры</h2>
                
                {product.heightMax && (
                  <div className="flex items-center">
                    <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
                      <Image src={product.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div className="relative w-[15%] aspect-square bg-transparent flex items-center justify-center flex-shrink-0">
                      <Image 
                        src="/size-arrow.png" 
                        alt="" 
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <span className="text-white text-base md:text-lg whitespace-nowrap ml-4">
                      {product.heightMax} мм — самая высокая модель
                    </span>
                  </div>
                )}

                {showMinHeight && product.heightMin && (
                  <div className="flex items-center">
                    <div className="relative w-[15%] aspect-square bg-transparent overflow-hidden flex-shrink-0">
                      <Image src={product.images[1] || product.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div className="relative w-[15%] aspect-square bg-transparent flex items-center justify-center flex-shrink-0">
                      <Image 
                        src="/size-arrow.png" 
                        alt="" 
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <span className="text-white text-base md:text-lg whitespace-nowrap ml-4">
                      {product.heightMin} мм — самая низкая модель
                    </span>
                  </div>
                )}
              </div>

              {/* Другие характеристики */}
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-white pb-3 mb-4">Другие характеристики</h2>
                <ul className="space-y-3 text-gray-300 text-lg">
                  <li><span className="font-medium text-white">Масштаб:</span> {product.scale}</li>
                  <li><span className="font-medium text-white">Материал:</span> фотополимерная смола Anycubic waterwash 2.0</li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-white">Цвет:</span>
                    <Image src="/color-hd-grey.png" alt="Серый" width={20} height={20} className="inline-block" />
                  </li>
                  {product.assembly && (
                    <li><span className="font-medium text-white">Сборка модели:</span> {product.assembly}</li>
                  )}
                  {product.artist && (
                    <li><span className="font-medium text-white">Художник:</span> {product.artist}</li>
                  )}
                </ul>
              </div>

              {/* Описание */}
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-white pb-3 mb-4">Описание</h2>
                <div className="prose prose-invert text-gray-300 max-w-none text-lg">
                  {product.description.split('\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Комплектация */}
              {product.contents && (
                <div className="mt-10">
                  <h2 className="text-xl font-semibold text-white pb-3 mb-4">Комплектация</h2>
                  <p className="text-gray-300 text-lg">{product.contents}</p>
                </div>
              )}

              {/* Совет */}
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-white pb-3 mb-4">Совет</h2>
                <p className="text-gray-300 text-lg">
                  Рекомендуем приклеить к подставке, клей и краски не входят в комплект.
                </p>
              </div>

              {related.length > 0 && (
                <section className="mt-16 mb-12">
                  <h2 className="text-2xl font-bold text-white mb-6">Рекомендованные товары</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {related.map(p => (
                      <ProductCard key={p.article} product={p} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="pl-8 hidden lg:block" />
          </div>
        </div>
      </div>

      <StickyBuyBar product={product} />
    </div>
  )
}