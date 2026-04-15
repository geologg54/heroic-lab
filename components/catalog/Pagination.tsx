// components/catalog/Pagination.tsx
export default function Pagination({ totalPages, currentPage, onPageChange }: { totalPages: number; currentPage: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 rounded-md ${p === currentPage ? 'bg-accent text-white' : 'bg-cardbg text-gray-300 hover:bg-accent/50'}`}>{p}</button>
      ))}
    </div>
  )
}