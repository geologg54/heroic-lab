// app/account/support/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AccountSidebar } from '@/components/account/AccountSidebar';

export default function AccountSupportPage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState<any>(null); // весь тикет
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (status === 'loading') return <div className="text-white py-20 text-center">Загрузка...</div>;
  if (!session) return null; // middleware перенаправит на /login

  // При монтировании ищем активный тикет пользователя (по email)
  useEffect(() => {
    fetch('/api/support/my-tickets')   // создадим такой эндпоинт
      .then(res => res.json())
      .then(data => {
        if (data.ticket) setTicket(data.ticket);
      })
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/support/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Ошибка');
      setLoading(false);
      return;
    }
    setTicket({ id: data.id, ticketNumber: data.ticketNumber, messages: [data.message], status: 'open' });
    setMessage('');
    setLoading(false);
  };

  const sendAdditional = async () => {
    if (!message.trim() || !ticket) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/support/conversations/${ticket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        setMessage('');
        // обновим тикет
        const res2 = await fetch(`/api/support/conversations/${ticket.id}`);
        if (res2.ok) setTicket(await res2.json());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Поддержка</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 bg-cardbg p-6 rounded-xl border border-borderLight max-w-2xl">
          {ticket && ticket.status === 'open' ? (
            <>
              <p className="text-gray-400 mb-4">Номер обращения: {ticket.ticketNumber}</p>
              <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
                {ticket.messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-accent text-white' : 'bg-[#0f2a42] text-gray-200'}`}>
                      <div className="text-xs opacity-75 mb-1">
                        {msg.senderType === 'admin' ? `Поддержка (${msg.admin?.name || 'Администратор'})` : 'Вы'}
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="flex-1 p-3 rounded bg-[#0f2a42] border border-borderLight text-white"
                  placeholder="Ваше сообщение..."
                  onKeyDown={e => e.key === 'Enter' && sendAdditional()}
                />
                <button onClick={sendAdditional} disabled={loading || !message.trim()} className="bg-accent px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50">
                  Отправить
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <h2 className="text-xl font-bold text-white">Новое обращение</h2>
              <textarea
                required
                rows={5}
                className="w-full p-3 rounded bg-[#0f2a42] border border-borderLight text-white"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Опишите ваш вопрос..."
              />
              {error && <div className="text-red-400">{error}</div>}
              <button type="submit" disabled={loading} className="bg-accent px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50">
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}