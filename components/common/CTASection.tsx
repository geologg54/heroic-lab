// components/common/CTASection.tsx
interface CTASectionProps {
  title: string
  text: string
  buttonText: string
  onButtonClick?: () => void
}

export const CTASection = ({ title, text, buttonText, onButtonClick }: CTASectionProps) => (
  <div className="bg-gradient-to-r from-[#0a2a3f] to-[#05192C] py-16 text-center border-y border-[#1e3a5f]">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
      <p className="text-gray-300 mb-6">{text}</p>
      <button onClick={onButtonClick} className="bg-accent hover:bg-cyan-700 px-8 py-3 rounded-lg font-semibold text-white transition">
        {buttonText}
      </button>
    </div>
  </div>
)