// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем режим standalone-сборки (для Docker)
  output: 'standalone',
  
  images: {
    unoptimized: true, // отключаем оптимизацию изображений
  },

  // РАЗРЕШАЕМ ДОСТУП С ТЕЛЕФОНА
  // Это ключ должен быть в корне, а не внутри experimental
  allowedDevOrigins: ['10.0.0.103'],   // ← IP твоего телефона
  // Если хочешь временно разрешить все устройства в сети, напиши '*'

  // Экспериментальные настройки (оставляем пустыми или добавляем другие)
  experimental: {
    // allowedDevOrigins здесь НЕ ДОЛЖНО быть!
  },
}

module.exports = nextConfig