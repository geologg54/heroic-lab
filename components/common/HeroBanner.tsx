// components/common/HeroBanner.tsx
import Link from 'next/link'

interface HeroBannerProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage?: string
}

export const HeroBanner = ({ title, subtitle, ctaText, ctaLink, backgroundImage }: HeroBannerProps) => {
  return (
    <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-gradient-to-r from-[#05192C] to-[#0a2a3f]">
      {backgroundImage && <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${backgroundImage})` }} />}
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
        <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
        <Link href={ctaLink} className="inline-block bg-accent hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition">
          {ctaText}
        </Link>
      </div>
    </div>
  )
}