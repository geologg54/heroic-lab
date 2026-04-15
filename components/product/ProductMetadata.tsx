// components/product/ProductMetadata.tsx
import { Product } from '@/types'

export const ProductMetadata = ({ product }: { product: Product }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-4 bg-cardbg rounded-xl border border-borderLight">
    <div><div className="text-gray-400 text-sm">Система</div><div className="text-white font-medium">{product.gameSystem}</div></div>
    <div><div className="text-gray-400 text-sm">Фракция</div><div className="text-white font-medium">{product.faction || '—'}</div></div>
    <div><div className="text-gray-400 text-sm">Масштаб</div><div className="text-white font-medium">{product.scale}</div></div>
    <div><div className="text-gray-400 text-sm">Тип</div><div className="text-white font-medium">{product.type}</div></div>
    <div><div className="text-gray-400 text-sm">Формат</div><div className="text-white font-medium">{product.fileFormat}</div></div>
    <div><div className="text-gray-400 text-sm">Файлов в комплекте</div><div className="text-white font-medium">1-5 STL</div></div>
    <div><div className="text-gray-400 text-sm">Скачиваний</div><div className="text-white font-medium">{product.downloadsCount}</div></div>
    <div><div className="text-gray-400 text-sm">Поддержка</div><div className="text-white font-medium">Есть</div></div>
  </div>
)