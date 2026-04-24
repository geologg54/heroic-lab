// app/contact/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function ContactForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('message') || '';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [ticket, setTicket] = useState<any>(null); // весь тикет
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('supportTicketId');
    if (storedId) {
      fetchTicket(storedId);
    }
  }, []);

  const fetchTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/support/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'open') {
          setTicket(data);
          localStorage.setItem('supportTicketId', data.id);
        } else {
          // тикет закрыт, забываем
          localStorage.removeItem('supportTicketId');
        }
      } else {
        localStorage.removeItem('supportTicketId');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload: any = { message };
    if (!session?.user) {
      if (!email) { setError('Укажите email'); setLoading(false); return; }
      payload.email = email;
      if (name) payload.name = name;
    }

    try {
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка отправки');
        return;
      }

      // сохраняем ID тикета и обновляем состояние
      localStorage.setItem('supportTicketId', data.id);
      setTicket({ id: data.id, ticketNumber: data.ticketNumber, messages: [data.message], status: 'open' });
      setMessage('');
      setSuccess(`Обращение создано. Номер: ${data.ticketNumber}`);
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  // Отправка дополнительного сообщения в существующий тикет
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
        await fetchTicket(ticket.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Если тикет уже есть, показываем переписку + поле ввода
  if (ticket && ticket.status === 'open') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Поддержка</h1>
        <p className="text-gray-400 mb-4">Номер обращения: {ticket.ticketNumber}</p>
        <div className="bg-cardbg border border-borderLight rounded-xl p-4 max-h-96 overflow-y-auto space-y-3 mb-4">
          {ticket.messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-accent text-white' : 'bg-[#0f2a42] text-gray-200'}`}>
                <div className="text-xs opacity-75 mb-1">
                  {msg.senderType === 'admin' ? `Поддержка (${msg.admin?.name || 'Администратор'})` : 'Вы'}
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="flex-1 p-3 rounded bg-cardbg border border-borderLight text-white"
            placeholder="Ваше сообщение..."
            onKeyDown={e => e.key === 'Enter' && sendAdditional()}
          />
          <button
            onClick={sendAdditional}
            disabled={loading || !message.trim()}
            className="bg-accent px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
          >
            Отправить
          </button>
        </div>
      </div>
    );
  }

  // Иначе форма нового обращения
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-6">Связь с поддержкой</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!session?.user && (
          <>
            <div>
              <label className="block text-white mb-1">Email *</label>
              <input
                type="email"
                required
                className="w-full p-3 rounded bg-cardbg border border-borderLight text-white"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ваш@email.ru"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Имя (необязательно)</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-cardbg border border-borderLight text-white"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-white mb-1">Сообщение *</label>
          <textarea
            required
            className="w-full p-3 rounded bg-cardbg border border-borderLight text-white"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Опишите ваш вопрос или проблему..."
          />
        </div>
        {error && <div className="text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Загрузка...</div>}>
      <ContactForm />
    </Suspense>
  );
}