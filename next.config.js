/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // для локальных файлов, чтобы не требовать оптимизацию
  },
}

module.exports = nextConfig