// components/account/TwoFactorSection.tsx
'use client'

import { useState, useEffect } from 'react'

interface TwoFactorSectionProps {
  isEnabled: boolean
  onEnable: () => Promise<{ qrCode?: string; secret?: string; error?: string }>
  onVerify: (code: string) => Promise<{ success?: boolean; error?: string }>
  onDisable: (code: string) => Promise<{ success?: boolean; error?: string }>
}

/**
 * Блок управления двухфакторной аутентификацией.
 * Показывает текущее состояние, кнопки включения/отключения и модальное окно настройки.
 */
export default function TwoFactorSection({
  isEnabled,
  onEnable,
  onVerify,
  onDisable,
}: TwoFactorSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<'qr' | 'verify'>('qr')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Сброс состояний при закрытии модалки
  const closeModal = () => {
    setShowModal(false)
    setStep('qr')
    setQrCode(null)
    setSecret('')
    setCode('')
    setError('')
  }

  // Кнопка "Включить 2FA"
  const handleEnable = async () => {
    setLoading(true)
    try {
      const result = await onEnable()
      if (result.error) {
        setError(result.error)
      } else {
        setQrCode(result.qrCode || null)
        setSecret(result.secret || '')
        setStep('qr')
        setShowModal(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // Проверка кода
  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await onVerify(code)
      if (result.success) {
        closeModal()
      } else {
        setError(result.error || 'Неверный код')
      }
    } finally {
      setLoading(false)
    }
  }

  // Отключение 2FA
  const handleDisable = async () => {
    const code = prompt('Введите код из приложения для подтверждения отключения 2FA')
    if (!code) return
    setLoading(true)
    try {
      const result = await onDisable(code)
      if (result.success) {
        // Успех – обновление состояния произойдёт через родительский компонент
      } else {
        alert(result.error || 'Неверный код')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-borderLight pt-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Двухфакторная аутентификация
      </h3>

      {!isEnabled ? (
        <div>
          <p className="text-gray-300 mb-4">
            Двухфакторная аутентификация отключена. Включите для повышения безопасности.
          </p>
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="bg-accent px-4 py-2 rounded-lg text-white"
          >
            {loading ? 'Загрузка...' : 'Включить 2FA'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-green-400 mb-2">✅ Двухфакторная аутентификация включена</p>
          <button
            type="button"
            onClick={handleDisable}
            disabled={loading}
            className="text-red-400 hover:text-red-300 underline"
          >
            Отключить 2FA
          </button>
        </div>
      )}

      {/* Модальное окно настройки 2FA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-cardbg p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Настройка 2FA</h3>

            {step === 'qr' && (
              <>
                <p className="text-gray-300 mb-2">
                  Отсканируйте QR-код в приложении-аутентификаторе.
                </p>
                <div className="flex justify-center mb-4">
                  {qrCode && <img src={qrCode} alt="QR Code" />}
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Или введите секретный ключ вручную: <br />
                  <code className="bg-black/30 p-1 rounded break-all">{secret}</code>
                </p>
                <button
                  onClick={() => setStep('verify')}
                  className="w-full bg-accent py-2 rounded-lg text-white mb-2"
                >
                  Далее
                </button>
              </>
            )}

            {step === 'verify' && (
              <>
                <p className="text-gray-300 mb-4">
                  Введите код из приложения для подтверждения:
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full p-3 rounded-lg bg-[#0f2a42] border border-borderLight text-white text-center text-2xl mb-4"
                />
                {error && <p className="text-red-400 mb-2">{error}</p>}
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full bg-accent py-2 rounded-lg text-white mb-2"
                >
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </button>
              </>
            )}

            <button
              onClick={closeModal}
              className="w-full text-gray-400 hover:text-white py-2"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}