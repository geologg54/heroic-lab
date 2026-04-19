// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем режим standalone-сборки.
  // Это создаст автономную папку .next/standalone, которую можно скопировать в Docker-образ
  // и запустить без установки node_modules.
  output: 'standalone',
  
  images: {
    unoptimized: true, // отключаем оптимизацию изображений (можно включить, но тогда нужен sharp)
  },
  
  // Если вы будете использовать PostgreSQL через Docker, нужно разрешить хост 'postgres'
  // (это не обязательно, но на всякий случай)
  experimental: {
    // ничего специфичного
  },
}

module.exports = nextConfig