// components/ui/DualRangeSlider.tsx
'use client'

interface DualRangeSliderProps {
  min: number
  max: number
  minValue: number
  maxValue: number
  onMinChange: (val: number) => void
  onMaxChange: (val: number) => void
}

export default function DualRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: DualRangeSliderProps) {
  const minPercent = ((minValue - min) / (max - min)) * 100
  const maxPercent = ((maxValue - min) / (max - min)) * 100

  return (
    <div className="relative w-full h-4 mt-2">
      <div className="absolute inset-0 rounded-full bg-borderLight" />
      <div
        className="absolute h-full rounded-full bg-white"
        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={minValue}
        onChange={(e) => onMinChange(Number(e.target.value))}
        className="dual-range-slider absolute w-full h-full appearance-none bg-transparent"
        style={{ zIndex: 3 }}
      />
      {/* Правый ползунок (максимум) */}
      <input
        type="range"
        min={min}
        max={max}
        value={maxValue}
        onChange={(e) => onMaxChange(Number(e.target.value))}
        className="dual-range-slider absolute w-full h-full appearance-none bg-transparent"
        style={{ zIndex: 4 }}
      />
    </div>
  )
}