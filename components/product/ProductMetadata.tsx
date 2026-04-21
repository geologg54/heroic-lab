// components/product/ProductMetadata.tsx
import { Product } from '@/types'

export const ProductMetadata = ({ product }: { product: Product }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-4 bg-cardbg rounded-xl border border-borderLight">
    <div>
      <div className="text-gray-400 text-sm">Масштаб</div>
      <div className="text-white font-medium">{product.scale}</div>
    </div>
    {product.assembly && (
      <div>
        <div className="text-gray-400 text-sm">Сборка</div>
        <div className="text-white font-medium">{product.assembly}</div>
      </div>
    )}
    {product.artist && (
      <div>
        <div className="text-gray-400 text-sm">Художник</div>
        <div className="text-white font-medium">{product.artist}</div>
      </div>
    )}
    {product.contents && (
      <div>
        <div className="text-gray-400 text-sm">Комплектация</div>
        <div className="text-white font-medium">{product.contents} шт.</div>
      </div>
    )}
  </div>
)