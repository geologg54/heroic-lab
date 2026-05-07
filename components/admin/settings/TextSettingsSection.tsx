// components/admin/settings/TextSettingsSection.tsx
'use client'

import { useRef } from 'react'
import { Download, Upload } from 'lucide-react'

interface TextFieldItem {
  key: string
  label: string
  value: string
  onChange: (key: string, value: string) => void
}

interface TextSettingsSectionProps {
  fields: TextFieldItem[]
}

/**
 * Секция с текстовыми полями (например, "О нас", "Доставка", "Контакты").
 * Для каждого поля можно выгрузить содержимое в файл и загрузить из файла.
 */
export default function TextSettingsSection({ fields }: TextSettingsSectionProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleExport = (content: string, filename: string) => {
    const blob = new Blob([content || ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      fields.find(f => f.key === key)?.onChange(key, content)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Тексты страниц</h2>
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-white font-medium mb-2">{field.label}</label>
            <textarea
              rows={6}
              value={field.value}
              onChange={(e) => field.onChange(field.key, e.target.value)}
              className="w-full p-3 rounded bg-[#0f2a42] border border-borderLight text-white resize-y"
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => handleExport(field.value, `${field.key}.txt`)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm"
              >
                <Download size={16} /> Экспорт
              </button>
              <button
                onClick={() => fileInputRefs.current[field.key]?.click()}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm"
              >
                <Upload size={16} /> Импорт
              </button>
              <input
                type="file"
                accept=".txt,text/plain"
                ref={(el) => { fileInputRefs.current[field.key] = el }}
                onChange={(e) => handleImport(e, field.key)}
                className="hidden"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}