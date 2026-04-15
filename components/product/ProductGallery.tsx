// components/product/ProductGallery.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images }: { images: string[] }) {
  const [main, setMain] = useState(images[0])
  return (
    <div className="space-y-3">
      <div className="aspect-square bg-[#0a1220] rounded-xl overflow-hidden border border-borderLight">
        <Image src={main} alt="Главное фото" width={600} height={600} className="w-full h-full object-contain p-4" />
      </div>
      <div className="flex gap-2">
        {images.map(img => <button key={img} onClick={() => setMain(img)} className={`w-20 h-20 rounded-md overflow-hidden border-2 ${main === img ? 'border-accent' : 'border-transparent'}`}><Image src={img} alt="" width={80} height={80} className="object-contain bg-black/20" /></button>)}
      </div>
    </div>
  )
}