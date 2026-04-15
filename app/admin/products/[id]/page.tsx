// app/admin/products/[id]/page.tsx
'use client'
import { ProductForm } from '@/components/admin/ProductForm'
import { useParams } from 'next/navigation'

export default function ProductEditPage() {
  const { id } = useParams()
  return <ProductForm productId={id as string} />
}