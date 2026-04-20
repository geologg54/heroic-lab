// app/delivery/page.tsx
import { prisma } from '@/lib/prisma'

export default async function DeliveryPage() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'delivery_text' }
  })
  const content = setting?.value || 'Информация о доставке появится скоро.'

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-6">Доставка и оплата</h1>
      <div className="prose prose-invert prose-lg text-gray-300 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  )
}