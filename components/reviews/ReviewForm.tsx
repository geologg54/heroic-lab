'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Star, Camera } from 'lucide-react';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: any) => void;
  editingReview?: any; // существующий отзыв для редактирования
}

export default function ReviewForm({ isOpen, onClose, onSuccess, editingReview }: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState(editingReview?.text || '');
  const [authorName, setAuthorName] = useState(editingReview?.authorName || session?.user?.name || '');
  const [orderId, setOrderId] = useState(editingReview?.orderId || '');
  const [orders, setOrders] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(editingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingReviewForOrder, setExistingReviewForOrder] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.name) setAuthorName(session.user.name);
  }, [session]);

  useEffect(() => {
    if (session?.user?.id && isOpen) {
      fetch('/api/user/orders?status=delivered')
        .then(res => res.json())
        .then(data => setOrders(data.orders || []))
        .catch(console.error);
    }
  }, [session, isOpen]);

  // Сброс при открытии/закрытии
  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating || 0);
      setText(editingReview.text || '');
      setAuthorName(editingReview.authorName || session?.user?.name || '');
      setOrderId(editingReview.orderId || '');
      setPreviews(editingReview.images || []);
    } else {
      setRating(0);
      setText('');
      setAuthorName(session?.user?.name || '');
      setOrderId('');
      setPreviews([]);
    }
  }, [editingReview, session, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    if (newFiles.length + previews.length > 3) {
      setError('Максимум 3 фотографии');
      return;
    }
    setImages(prev => [...prev, ...newFiles]);
    const objectUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...objectUrls]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (rating === 0) {
      setError('Поставьте оценку');
      return;
    }
    if (!text.trim()) {
      setError('Напишите отзыв');
      return;
    }
    if (!orderId && !editingReview) {
      setError('Выберите заказ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imagePaths: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(file => formData.append('images', file));
        const uploadRes = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Ошибка загрузки');
        }
        const uploadData = await uploadRes.json();
        imagePaths = uploadData.paths;
      } else if (previews.length > 0 && !images.length) {
        // Если редактируем и не меняли фото, оставляем старые пути
        imagePaths = previews.filter(p => p.startsWith('/images/feedback/'));
      }

      const url = editingReview ? '/api/reviews?id=' + editingReview.id : '/api/reviews';
      const method = editingReview ? 'PATCH' : 'POST';
      const body = editingReview
        ? { id: editingReview.id, rating, text: text.trim(), authorName: authorName?.trim() || 'Анонимно', imagePaths }
        : { rating, text: text.trim(), authorName: authorName?.trim() || 'Анонимно', orderId, imagePaths };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка сохранения');
      }

      const createdReview = await res.json();
      onSuccess({ ...createdReview, images: imagePaths.length ? imagePaths : previews, isPending: true });

      // Сброс
      setRating(0);
      setText('');
      setOrderId('');
      setImages([]);
      setPreviews([]);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-cardbg border border-borderLight rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{editingReview ? 'Редактировать отзыв' : 'Оставьте отзыв'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        {!session && <p className="text-red-400 mb-4">Войдите, чтобы оставить отзыв</p>}

        {session && (
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-1">Оценка</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}>
                    <Star size={28} fill={(hoverRating || rating) >= i ? '#fbbf24' : 'none'} color={(hoverRating || rating) >= i ? '#fbbf24' : '#9ca3af'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-white mb-1">Имя</label>
              <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder={authorName || 'Анонимно'} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
              <p className="text-xs text-gray-400 mt-1">Если оставить пустым, будет "Анонимно"</p>
            </div>
            {!editingReview && (
              <div>
                <label className="block text-white mb-1">Номер заказа *</label>
                <select value={orderId} onChange={e => setOrderId(e.target.value)} required className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white">
                  <option value="">Выберите заказ</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>№ {order.orderNumber} ({new Date(order.createdAt).toLocaleDateString('ru-RU')})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-white mb-1">Отзыв</label>
              <textarea rows={4} value={text} onChange={e => setText(e.target.value)} className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" placeholder="Расскажите о своём опыте..." />
            </div>
            <div>
              <label className="block text-white mb-1">Фото (до 3 штук, не более 10мб каждая)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-borderLight">
                    <Image src={src} alt="preview" fill className="object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
                  </div>
                ))}
              </div>
              {previews.length < 3 && (
                <label className="cursor-pointer inline-flex items-center gap-2 text-accent hover:text-cyan-700">
                  <Camera size={20} />
                  <span>Добавить фото</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-accent hover:bg-cyan-700 py-3 rounded-lg font-bold text-white disabled:opacity-50 transition-colors">
              {loading ? 'Отправка...' : editingReview ? 'Сохранить' : 'Отправить отзыв'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}