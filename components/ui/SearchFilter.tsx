// components/ui/SearchFilter.tsx
'use client'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface SearchFilterProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export const SearchFilter = ({ onSearch, placeholder = 'Поиск...' }: SearchFilterProps) => {
  const [query, setQuery] = useState('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onSearch(e.target.value)
  }
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full md:w-80 pl-10 pr-4 py-2 rounded-lg bg-cardbg border border-borderLight text-white placeholder-gray-500 focus:outline-none focus:border-accent"
      />
    </div>
  )
}