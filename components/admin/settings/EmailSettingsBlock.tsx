// components/admin/settings/EmailSettingsBlock.tsx
'use client'

import EmailTemplateSection from './EmailTemplateSection'

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

interface EmailSettingsBlockProps {
  settings: SettingsData   // ← теперь конкретный тип
  onSubjectChange: (key: string, value: string) => void
  onBodyChange: (key: string, value: string) => void
}

export default function EmailSettingsBlock({ settings, onSubjectChange, onBodyChange }: EmailSettingsBlockProps) {
  const templates = [
    {
      title: 'Подтверждение заказа (покупателю)',
      subjectKey: 'email_order_confirmation_subject' as keyof SettingsData,
      bodyKey: 'email_order_confirmation_body' as keyof SettingsData,
    },
    {
      title: 'Уведомление админа о новом заказе',
      subjectKey: 'email_admin_new_order_subject' as keyof SettingsData,
      bodyKey: 'email_admin_new_order_body' as keyof SettingsData,
    },
    {
      title: 'Уведомление о смене статуса заказа',
      subjectKey: 'email_status_update_subject' as keyof SettingsData,
      bodyKey: 'email_status_update_body' as keyof SettingsData,
    },
    {
      title: 'Письмо с купоном',
      subjectKey: 'email_coupon_subject' as keyof SettingsData,
      bodyKey: 'email_coupon_body' as keyof SettingsData,
    },
  ]

  return (
    <div className="bg-cardbg border border-borderLight rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Шаблоны писем</h2>
      <div className="space-y-8">
        {templates.map((t) => (
          <EmailTemplateSection
            key={t.subjectKey}
            title={t.title}
            subjectKey={t.subjectKey}
            bodyKey={t.bodyKey}
            subject={settings[t.subjectKey] || ''}
            body={settings[t.bodyKey] || ''}
            onSubjectChange={onSubjectChange}
            onBodyChange={onBodyChange}
          />
        ))}
      </div>
    </div>
  )
}