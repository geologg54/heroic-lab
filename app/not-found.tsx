// app/not-found.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Картинка 404 */}
      <div className="mb-8">
        <Image
          src="/404pic.png"
          alt="404 - Страница не найдена"
          width={400}
          height={140}
          className="w-auto h-auto"
          priority
        />
      </div>

      {/* Первая фраза */}
      <p className="text-gray-300 text-lg md:text-xl max-w-md mb-4">
        Туман между мирами сгустился, не стоит задерживаться здесь.
      </p>

      {/* Вторая фраза */}
      <p className="text-gray-400 text-md mb-8">
        Лучше вернуться на дорогу приключений:
      </p>

      {/* Кнопка в каталог */}
      <Link
        href="/catalog"
        className="inline-block border border-gray-400 hover:bg-accent hover:border-accent text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
      >
        В каталог
      </Link>
    </div>
  )
}