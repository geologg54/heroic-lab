// components/layout/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-darkbg py-8 mt-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="text-white font-bold mb-4">Героическая лаборатория</h3>
            <p className="text-sm text-gray-400">Миниатюры и аксессуары для настольных игр</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Новичкам</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition">Частые вопросы</Link></li>
              <li><Link href="/custom" className="hover:text-white transition">Особые заказы</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Поддержка</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Информация</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition">Доставка</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: lab@heroic.ru</li>
              <li>Telegram: @heroic_lab</li>
              <li>
                <a 
                  href="https://vk.com/heroiclab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Сообщество VK
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-12 pt-4">
          Героическая лаборатория миниатюр©
        </div>
      </div>
    </footer>
  )
}