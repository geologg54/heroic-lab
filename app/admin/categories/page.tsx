'use client'
import { useState } from 'react'
import { ChevronRight, ChevronDown, Edit, Trash2, FolderOpen } from 'lucide-react'

const mockCategories = [
  { id: '1', name: 'Космодесант', children: [{ id: '1-1', name: 'Кровавые Ангелы' }, { id: '1-2', name: 'Ультрамарины' }] },
  { id: '2', name: 'Trench Crusade', children: [] },
]

export const CategoryTree = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const renderTree = (items: any[]) => items.map(item => (
    <div key={item.id} className="ml-4 mt-1">
      <div className="flex items-center gap-2 py-1 hover:bg-white/5 rounded px-2">
        <button onClick={() => toggle(item.id)}>{expanded[item.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
        <FolderOpen size={16} className="text-accent" />
        <span className="text-white flex-1">{item.name}</span>
        <button><Edit size={14} className="text-gray-400" /></button>
        <button><Trash2 size={14} className="text-red-400" /></button>
      </div>
      {expanded[item.id] && item.children && <div className="ml-6">{renderTree(item.children)}</div>}
    </div>
  ))
  return <div className="bg-cardbg border border-borderLight rounded-xl p-4">{renderTree(mockCategories)}</div>
}