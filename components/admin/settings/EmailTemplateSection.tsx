// components/admin/settings/EmailTemplateSection.tsx
'use client'

import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'

interface EmailTemplateSectionProps {
  title: string
  subjectKey: string
  bodyKey: string
  subject: string
  body: string
  onSubjectChange: (key: string, value: string) => void
  onBodyChange: (key: string, value: string) => void
}

/**
 * Секция одного шаблона письма: тема письма + тело письма с кнопками экспорта/импорта.
 */
export default function EmailTemplateSection({
  title,
  subjectKey,
  bodyKey,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}: EmailTemplateSectionProps) {
  const bodyInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const blob = new Blob([body || ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bodyKey}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      onBodyChange(bodyKey, content)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <div>
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <div className="mb-3">
        <label className="block text-gray-300 text-sm mb-1">Тема письма</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(subjectKey, e.target.value)}
          className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
          placeholder="Тема письма"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Download size={18} /> Экспорт тела письма
        </button>
        <button
          onClick={() => bodyInputRef.current?.click()}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
        >
          <Upload size={18} /> Импорт тела письма
        </button>
        <input
          type="file"
          ref={bodyInputRef}
          accept=".txt,text/plain"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  )
}