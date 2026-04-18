// app/admin/products/[article]/page.tsx
'use client'
import { ProductForm } from '@/components/admin/ProductForm'
import { useParams } from 'next/navigation'

export default function EditProductPage() {
  const { article } = useParams()
  return <ProductForm productArticle={article as string} />
}