// app/admin/settings/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Download, Upload } from 'lucide-react'

interface SettingsData {
  about_text?: string
  delivery_text?: string
  contacts_text?: string
  email_order_confirmation_subject?: string
  email_order_confirmation_body?: string
  email_admin_new_order_subject?: string
  email_admin_new_order_body?: string
  email_status_update_subject?: string
  email_status_update_body?: string
  email_coupon_subject?: string
  email_coupon_body?: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const aboutInputRef = useRef<HTMLInputElement>(null)
  const deliveryInputRef = useRef<HTMLInputElement>(null)
  const contactsInputRef = useRef<HTMLInputElement>(null)
  const confirmBodyInputRef = useRef<HTMLInputElement>(null)
  const adminBodyInputRef = useRef<HTMLInputElement>(null)
  const statusBodyInputRef = useRef<HTMLInputElement>(null)
  const couponBodyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setMessage({ type: 'error', text: 'Ошибка загрузки настроек' })
        setLoading(false)
      })
  }, [])

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Настройки сохранены' })
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Ошибка сохранения' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка сети' })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = (content: string | undefined, filename: string) => {
    const blob = new Blob([content || ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, key: keyof SettingsData) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      handleChange(key, content)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  if (loading) return <div className="text-white">Загрузка...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Настройки сайта</h1>
        <button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="bg-accent hover:bg-cyan-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Сохранение...' : 'Сохранить все'}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-500 text-green-300'
              : 'bg-red-900/30 border border-red-500 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Тексты страниц (О нас, Доставка, Контакты) - без изменений */}
        {/* ... опущено для краткости, оставьте как было */}

        {/* Шаблоны писем */}
        <div className="bg-cardbg border border-borderLight rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Шаблоны писем</h2>

          <div className="space-y-8">
            {/* Подтверждение заказа */}
            <div>
              <h3 className="text-white font-medium mb-2">Подтверждение заказа (покупателю)</h3>
              <div className="mb-3">
                <label className="block text-gray-300 text-sm mb-1">Тема письма</label>
                <input
                  type="text"
                  value={settings.email_order_confirmation_subject || ''}
                  onChange={e => handleChange('email_order_confirmation_subject', e.target.value)}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white"
                  placeholder="Тема письма"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleExport(settings.email_order_confirmation_body, 'order_confirmation_body.txt')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Download size={18} /> Экспорт тела письма
                </button>
                <button onClick={() => confirmBodyInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Upload size={18} /> Импорт тела письма
                </button>
                <input type="file" ref={confirmBodyInputRef} accept=".txt,text/plain"
                  onChange={(e) => handleImport(e, 'email_order_confirmation_body')} className="hidden" />
              </div>
            </div>

            {/* Уведомление админа о новом заказе */}
            <div>
              <h3 className="text-white font-medium mb-2">Уведомление админа о новом заказе</h3>
              <div className="mb-3">
                <label className="block text-gray-300 text-sm mb-1">Тема письма</label>
                <input type="text" value={settings.email_admin_new_order_subject || ''}
                  onChange={e => handleChange('email_admin_new_order_subject', e.target.value)}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleExport(settings.email_admin_new_order_body, 'admin_new_order_body.txt')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Download size={18} /> Экспорт тела письма
                </button>
                <button onClick={() => adminBodyInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Upload size={18} /> Импорт тела письма
                </button>
                <input type="file" ref={adminBodyInputRef} accept=".txt,text/plain"
                  onChange={(e) => handleImport(e, 'email_admin_new_order_body')} className="hidden" />
              </div>
            </div>

            {/* Уведомление о смене статуса заказа */}
            <div>
              <h3 className="text-white font-medium mb-2">Уведомление о смене статуса заказа</h3>
              <div className="mb-3">
                <label className="block text-gray-300 text-sm mb-1">Тема письма</label>
                <input type="text" value={settings.email_status_update_subject || ''}
                  onChange={e => handleChange('email_status_update_subject', e.target.value)}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleExport(settings.email_status_update_body, 'status_update_body.txt')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Download size={18} /> Экспорт тела письма
                </button>
                <button onClick={() => statusBodyInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Upload size={18} /> Импорт тела письма
                </button>
                <input type="file" ref={statusBodyInputRef} accept=".txt,text/plain"
                  onChange={(e) => handleImport(e, 'email_status_update_body')} className="hidden" />
              </div>
            </div>

            {/* Купонное письмо */}
            <div>
              <h3 className="text-white font-medium mb-2">Письмо с купоном</h3>
              <div className="mb-3">
                <label className="block text-gray-300 text-sm mb-1">Тема письма</label>
                <input type="text" value={settings.email_coupon_subject || ''}
                  onChange={e => handleChange('email_coupon_subject', e.target.value)}
                  className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleExport(settings.email_coupon_body, 'coupon_body.txt')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Download size={18} /> Экспорт тела письма
                </button>
                <button onClick={() => couponBodyInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white">
                  <Upload size={18} /> Импорт тела письма
                </button>
                <input type="file" ref={couponBodyInputRef} accept=".txt,text/plain"
                  onChange={(e) => handleImport(e, 'email_coupon_body')} className="hidden" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}