// app/about/page.tsx
import { prisma } from '@/lib/prisma'

export default async function AboutPage() {
  const setting = await prisma.setting.findUnique({
    where: { key: 'about_text' }
  })
  const content = setting?.value || 'Информация о компании появится скоро.'

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-6">О нас</h1>
      <div className="prose prose-invert prose-lg text-gray-300">
        {content.split('\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}