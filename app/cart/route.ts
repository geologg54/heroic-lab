// app/api/cart/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// Получить корзину пользователя
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] })
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } }
  })

  // Преобразуем к формату, совместимому с клиентской корзиной
  const items = cartItems.map(item => ({
    product: {
      ...item.product,
      images: item.product.images.split(','),
      tags: item.product.tags.split(','),
      image: item.product.images.split(',')[0] || '',
    },
    quantity: item.quantity,
  }))

  return NextResponse.json({ items })
}

// Сохранить корзину пользователя (замена)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items } = await request.json()

  // Удаляем старую корзину
  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })

  // Создаём новые записи
  for (const item of items) {
    await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productArticle: item.product.article,
        quantity: item.quantity,
      }
    })
  }

  return NextResponse.json({ success: true })
}