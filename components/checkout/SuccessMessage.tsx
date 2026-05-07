// components/checkout/SuccessMessage.tsx

/**
 * Сообщение об успешном оформлении заказа.
 */
export default function SuccessMessage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-green-400 text-4xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-white">Заказ оформлен!</h2>
      <p className="text-gray-300 mt-2">
        Спасибо за заказ. Мы свяжемся с вами для подтверждения.
      </p>
      <p className="text-gray-400 text-sm mt-4">Перенаправление...</p>
    </div>
  )
}