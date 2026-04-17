// app/admin/products/[article]/page.tsx
'use client'
import { ProductForm } from '@/components/admin/ProductForm'
import { useParams } from 'next/navigation'

export default function ProductEditPage() {
  const { article } = useParams()
  return <ProductForm productId={article as string} />
}