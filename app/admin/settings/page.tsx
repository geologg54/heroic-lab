// app/admin/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import TextSettingsSection from '@/components/admin/settings/TextSettingsSection'
import EmailSettingsBlock from '@/components/admin/settings/EmailSettingsBlock'

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

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setMessage({ type: 'error', text: 'Ошибка загрузки настроек' })
        setLoading(false)
      })
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
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

  if (loading) return <div className="text-white">Загрузка...</div>

  const textFields = [
    { key: 'about_text', label: 'О нас', value: settings.about_text || '' },
    { key: 'delivery_text', label: 'Доставка и оплата', value: settings.delivery_text || '' },
    { key: 'contacts_text', label: 'Контакты', value: settings.contacts_text || '' },
  ].map((f) => ({ ...f, onChange: handleChange }))

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
        <TextSettingsSection fields={textFields} />
        <EmailSettingsBlock settings={settings} onSubjectChange={handleChange} onBodyChange={handleChange} />
      </form>
    </div>
  )
}