// components/layout/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-darkbg border-t border-[#1e3a5f] py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">Героическая лаборатория</h3>
            <p className="text-sm text-gray-400">Миниатюры и аксессуары для настольных игр</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Каталог</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/catalog">Все модели</Link></li>
              <li><Link href="/category/space-marines">Космодесант</Link></li>
              <li><Link href="/category/trench-crusade">Trench Crusade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Информация</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about">О нас</Link></li>
              <li><Link href="/delivery">Доставка</Link></li>
              <li><Link href="/privacy">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: lab@heroic.ru</li>
              <li>Telegram: @heroic_lab</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-[#1e3a5f]">
          Героическая лаборатория миниатюр©
        </div>
      </div>
    </footer>
  )
}