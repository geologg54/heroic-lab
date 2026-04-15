// components/catalog/Breadcrumbs.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem { label: string; href?: string }
export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        {item.href ? <Link href={item.href} className="hover:text-accent">{item.label}</Link> : <span className="text-white">{item.label}</span>}
        {i < items.length - 1 && <ChevronRight size={14} />}
      </div>
    ))}
  </div>
)