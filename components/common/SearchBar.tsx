// components/common/SearchBar.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        placeholder="Поиск моделей..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full py-2 px-4 pr-10 rounded-full bg-[#0f2a42] border border-[#1e4a6e] text-white placeholder-gray-400 focus:outline-none focus:border-accent"
      />
      <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
        <Search size={18} />
      </button>
    </form>
  )
}