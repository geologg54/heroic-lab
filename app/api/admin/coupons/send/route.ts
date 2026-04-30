// app/api/admin/coupons/send/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getSetting } from '@/lib/settings';

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return error;
  }

  const { code, type, value, minOrderAmount, maxUses, validUntil, stackable, userIds } = await request.json();

  if (!code || !type || value === undefined || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'Не заполнены обязательные поля или не выбраны пользователи' }, { status: 400 });
  }

  // Создаём купон
  const coupon = await prisma.coupon.create({
    data: {
      code: code.trim().toUpperCase(),
      type,
      value: parseInt(value),
      minOrderAmount: minOrderAmount ? parseInt(minOrderAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      validFrom: new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: true,
      stackable: stackable ?? false,
    },
  });

  // Создаём записи UserCoupon и отправляем письма
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  });

  const userCouponPromises = users.map(user =>
    prisma.userCoupon.create({
      data: {
        userId: user.id,
        couponId: coupon.id,
        emailSent: false,
      },
    })
  );

  await Promise.all(userCouponPromises);

  // Отправка писем
  const subject = await getSetting('email_coupon_subject', 'Ваш персональный промокод');
  const bodyTemplate = await getSetting('email_coupon_body',
    `Здравствуйте, {{name}}!\n\nВаш персональный промокод: {{code}}\nСкидка: {{discount}}\n\nИспользуйте его при оформлении заказа на сайте {{siteUrl}}.\n\nС уважением,\nГероическая лаборатория миниатюр`
  );

  for (const user of users) {
    if (!user.email) continue;
    const body = bodyTemplate
      .replace('{{name}}', user.name || 'покупатель')
      .replace('{{code}}', coupon.code)
      .replace('{{discount}}', coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} ₽`)
      .replace('{{siteUrl}}', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    sendEmail({ to: user.email, subject, text: body })
      .then(() => prisma.userCoupon.updateMany({
        where: { userId: user.id, couponId: coupon.id },
        data: { emailSent: true },
      }))
      .catch(console.error);
  }

  return NextResponse.json({ success: true, couponId: coupon.id }, { status: 201 });
}