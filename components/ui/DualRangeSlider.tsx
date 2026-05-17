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
  if (min >= max) return null;

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;
  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);

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
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val <= maxValue) onMinChange(val);
        }}
        className="dual-range-slider absolute w-full h-full appearance-none bg-transparent"
        style={{ zIndex: 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxValue}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val >= minValue) onMaxChange(val);
        }}
        className="dual-range-slider absolute w-full h-full appearance-none bg-transparent"
        style={{ zIndex: 4 }}
      />
    </div>
  )
}