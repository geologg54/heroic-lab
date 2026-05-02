// app/api/admin/reviews/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return error;
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const featured = searchParams.get('featured');
  const hasPhoto = searchParams.get('hasPhoto');
  const rating = searchParams.get('rating');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  const where: any = {};
  if (status) where.status = status;
  if (featured === 'true') where.featured = true;
  if (featured === 'false') where.featured = false;
  if (hasPhoto === 'true') where.images = { not: '' };
  if (hasPhoto === 'false') where.images = '';
  if (rating) where.rating = parseInt(rating);

  let orderBy: any = {};
  switch (sortBy) {
    case 'rating': orderBy = { rating: order }; break;
    case 'createdAt': orderBy = { createdAt: order }; break;
    default: orderBy = { createdAt: 'desc' };
  }

  try {
    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      include: { user: { select: { name: true } } },
    });
    const formatted = reviews.map(r => ({
      ...r,
      images: r.images ? r.images.split(',').filter(Boolean) : [],
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Ошибка получения отзывов для админа:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return error;
  }
  const { id, status, featured, text, sourceUrl, images } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Не передан ID' }, { status: 400 });
  }

  const updateData: any = {};
  if (status && ['approved', 'rejected'].includes(status)) {
    updateData.status = status;
  }
  if (featured !== undefined) updateData.featured = featured;

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Отзыв не найден' }, { status: 404 });
  }
  if (existing.isExternal) {
    if (text !== undefined) updateData.text = text;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;
    if (images !== undefined) updateData.images = Array.isArray(images) ? images.join(',') : images;
  }
  try {
    const review = await prisma.review.update({ where: { id }, data: updateData });
    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления отзыва' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return error;
  }
  const { rating, text, sourceUrl, images } = await request.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Оценка обязательна (1-5)' }, { status: 400 });
  }
  if (!sourceUrl || !/^https?:\/\/.+/.test(sourceUrl)) {
    return NextResponse.json({ error: 'Некорректная ссылка на источник' }, { status: 400 });
  }
  try {
    const review = await prisma.review.create({
      data: {
        rating,
        text: text?.trim() || '',
        sourceUrl: sourceUrl.trim(),
        images: Array.isArray(images) ? images.join(',') : '',
        isExternal: true,
        status: 'approved',
        authorName: 'Внешний отзыв',
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания внешнего отзыва:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}