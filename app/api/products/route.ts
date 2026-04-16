import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true } // подтягиваем данные о категории
  })
  return NextResponse.json(products)
}