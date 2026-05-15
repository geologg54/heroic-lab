// components/account/ProfileForm.tsx
'use client'

import { useState } from 'react'

interface ProfileFormData {
  name: string
  email: string
  newPassword: string
  confirmPassword: string
}

interface ProfileFormProps {
  initialData: ProfileFormData
  onSubmit: (form: ProfileFormData) => Promise<void>
  loading: boolean
}

/**
 * Форма редактирования профиля: имя, email, новый пароль.
 * Вся логика валидации и отправки остаётся на странице-родителе.
 */
export default function ProfileForm({ initialData, onSubmit, loading }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormData>(initialData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
    // После успешной отправки очищаем поля паролей
    setForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Имя */}
      <div>
        <label className="block text-white mb-2">Имя</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
          placeholder="Ваше имя"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-white mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
        />
      </div>

      {/* Смена пароля */}
      <div className="border-t border-borderLight pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Сменить пароль</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Новый пароль</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Подтвердите новый пароль</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white"
            />
          </div>
        </div>
      </div>

      {/* Кнопка сохранения */}
      <button
        type="submit"
        disabled={loading}
        className="bg-accent hover:bg-cyan-700 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition"
      >
        {loading ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </form>
  )
}