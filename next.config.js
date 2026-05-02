// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем режим standalone-сборки (для Docker)
  output: 'standalone',
  
  images: {
    unoptimized: true, // отключаем оптимизацию изображений
  },

  // РАЗРЕШАЕМ ДОСТУП С ТЕЛЕФОНА

  allowedDevOrigins: ['10.0.0.107'],   // ← IP твоего телефона
  // Если хочешь временно разрешить все устройства в сети, напиши '*'
  experimental: {},
}

module.exports = nextConfig