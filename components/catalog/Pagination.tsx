// components/catalog/Pagination.tsx
export default function Pagination({ totalPages, currentPage, onPageChange }: { totalPages: number; currentPage: number; onPageChange: (page: number) => void }) {
  return (
    <nav className="w-full px-4">
      <ul className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <li key={p} className="list-none">
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-[2.5rem] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-accent text-white'
                  : 'bg-cardbg text-gray-300 hover:bg-accent/50'
              }`}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}