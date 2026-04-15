// components/common/CollectionBlock.tsx
import Link from 'next/link'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Product } from '@/types'

interface CollectionBlockProps {
  title: string
  subtitle: string
  link: string
  products: Product[]
}

export const CollectionBlock = ({ title, subtitle, link, products }: CollectionBlockProps) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      <Link href={link} className="text-accent hover:underline">Смотреть всё →</Link>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  </div>
)