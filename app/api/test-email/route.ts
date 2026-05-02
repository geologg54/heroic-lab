// app/api/test-email/route.ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function GET() {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'heroic.lab@yandex.ru',
      subject: 'Тестовое письмо',
      text: 'Если вы получили это письмо, SMTP работает корректно.',
    })
    return NextResponse.json({ success: true, message: 'Письмо отправлено' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}