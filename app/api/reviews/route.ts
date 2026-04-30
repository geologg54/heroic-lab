// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }
  try {
    const { rating, text, orderId, authorName, imagePaths } = await request.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Оценка должна быть от 1 до 5' }, { status: 400 });
    }
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Текст отзыва обязателен' }, { status: 400 });
    }
    if (!orderId) {
      return NextResponse.json({ error: 'Выберите заказ' }, { status: 400 });
    }
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id, status: 'delivered' }
    });
    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден или не доставлен' }, { status: 400 });
    }
    const existingReview = await prisma.review.findFirst({
      where: { orderId, userId: session.user.id }
    });
    if (existingReview) {
      return NextResponse.json({ error: 'Вы уже оставили отзыв на этот заказ. Редактируйте существующий.' }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        rating,
        text: text.trim(),
        authorName: authorName?.trim() || 'Анонимно',
        orderId,
        images: Array.isArray(imagePaths) ? imagePaths.join(',') : '',
        status: 'pending',
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания отзыва:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }
  try {
    const { id, rating, text, authorName, imagePaths } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Не указан ID отзыва' }, { status: 400 });
    }
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Отзыв не найден или доступ запрещён' }, { status: 404 });
    }
    const updateData: any = { status: 'pending' };
    if (rating !== undefined) updateData.rating = rating;
    if (text !== undefined) updateData.text = text.trim();
    if (authorName !== undefined) updateData.authorName = authorName?.trim() || 'Анонимно';
    if (imagePaths !== undefined) updateData.images = Array.isArray(imagePaths) ? imagePaths.join(',') : existing.images;
    const updated = await prisma.review.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Ошибка обновления отзыва:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;
  const featured = searchParams.get('featured');
  const where: any = {};
  if (featured === 'true') {
    where.featured = true;
    where.status = 'approved';
  } else {
    where.status = 'approved';
  }
  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
          order: { select: { orderNumber: true, createdAt: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);
    const formatted = reviews.map(r => ({
      ...r,
      images: r.images ? r.images.split(',').filter(Boolean) : [],
      orderDate: r.order?.createdAt || null,
      orderNumber: r.order?.orderNumber || null,
    }));
    return NextResponse.json({
      reviews: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}