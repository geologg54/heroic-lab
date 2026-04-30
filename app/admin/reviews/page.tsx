'use client';
import { useState, useEffect, useRef } from 'react';
import { Check, X, Upload, Star, Edit2, Save, XCircle } from 'lucide-react';

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'external'>('pending');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Фильтры
  const [filterFeatured, setFilterFeatured] = useState('');
  const [filterHasPhoto, setFilterHasPhoto] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Для внешнего отзыва
  const [extRating, setExtRating] = useState(5);
  const [extSourceUrl, setExtSourceUrl] = useState('');
  const [extImages, setExtImages] = useState<File[]>([]);
  const [extPreviews, setExtPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Редактирование внешнего отзыва
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editSourceUrl, setEditSourceUrl] = useState('');

  const fetchReviews = async (status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== 'external') params.set('status', status);
      if (status === 'external') params.set('isExternal', 'true');
      else if (status !== 'external') params.set('status', status || 'pending');
      params.set('sortBy', sortBy);
      params.set('order', sortOrder);
      if (filterFeatured) params.set('featured', filterFeatured);
      if (filterHasPhoto) params.set('hasPhoto', filterHasPhoto);
      if (filterRating) params.set('rating', filterRating);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();
      setReviews(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab, filterFeatured, filterHasPhoto, filterRating, sortBy, sortOrder]);

  // Модерация
  const handleModeration = async (id: string, status: 'approved' | 'rejected') => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchReviews(activeTab);
  };

  // Переключение "На главной"
  const toggleFeatured = async (id: string, current: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, featured: !current }),
    });
    fetchReviews(activeTab);
  };

  // Редактирование внешнего отзыва
  const startEdit = (review: any) => {
    setEditingId(review.id);
    setEditText(review.text || '');
    setEditSourceUrl(review.sourceUrl || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditSourceUrl('');
  };

  const saveEdit = async (id: string) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, text: editText, sourceUrl: editSourceUrl }),
    });
    setEditingId(null);
    fetchReviews(activeTab);
  };

  // Мульти-загрузка для внешнего отзыва
  const handleFileChangeMulti = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setExtImages(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setExtPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExtImage = (index: number) => {
    setExtImages(prev => prev.filter((_, i) => i !== index));
    setExtPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleExternalSubmit = async () => {
    if (extImages.length === 0 || !extSourceUrl) return alert('Заполните обязательные поля');
    setSaving(true);
    try {
      const formData = new FormData();
      extImages.forEach(file => formData.append('images', file));
      const uploadRes = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Ошибка загрузки');
      const uploadData = await uploadRes.json();
      const imagePaths = uploadData.paths;

      await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: extRating, text: '', sourceUrl: extSourceUrl, images: imagePaths }),
      });
      setExtSourceUrl('');
      setExtImages([]);
      setExtPreviews([]);
      fetchReviews('external');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Управление отзывами</h1>

      {/* Вкладки */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['pending', 'approved', 'rejected', 'external'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setEditingId(null); }}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === tab ? 'bg-accent text-white' : 'bg-cardbg border border-borderLight text-gray-300 hover:text-white'
            }`}
          >
            {tab === 'pending' && 'На модерации'}
            {tab === 'approved' && 'Опубликованные'}
            {tab === 'rejected' && 'Отклонённые'}
            {tab === 'external' && 'Добавить внешний'}
          </button>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}
          className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white">
          <option value="">Все</option>
          <option value="true">На главной</option>
          <option value="false">Не на главной</option>
        </select>
        <select value={filterHasPhoto} onChange={e => setFilterHasPhoto(e.target.value)}
          className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white">
          <option value="">Фото: любые</option>
          <option value="true">С фото</option>
          <option value="false">Без фото</option>
        </select>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
          className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white">
          <option value="">Любой рейтинг</option>
          {[5,4,3,2,1].map(i => <option key={i} value={i}>{i} зв.</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-sm text-white">
          <option value="createdAt">Дата</option>
          <option value="rating">Рейтинг</option>
        </select>
        <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="bg-[#0f2a42] border border-borderLight rounded px-3 py-1 text-sm text-white">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Форма добавления внешнего отзыва */}
      {activeTab === 'external' && (
        <div className="bg-cardbg border border-borderLight rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Добавить внешний отзыв</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-white mb-1">Оценка</label>
              <select value={extRating} onChange={e => setExtRating(Number(e.target.value))}
                className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white">
                {[5,4,3,2,1].map(i => <option key={i} value={i}>{i} звёзд</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white mb-1">Ссылка на отзыв *</label>
              <input type="url" value={extSourceUrl} onChange={e => setExtSourceUrl(e.target.value)}
                placeholder="https://..." className="w-full p-2 rounded bg-[#0f2a42] border border-borderLight text-white" />
            </div>
            <div>
              <label className="block text-white mb-1">Скриншоты отзыва *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {extPreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-borderLight">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => removeExtImage(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 text-accent hover:text-cyan-700">
                <Upload size={20} />
                <span>Загрузить изображения</span>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChangeMulti} className="hidden" />
              </label>
            </div>
            <button onClick={handleExternalSubmit} disabled={saving}
              className="bg-accent hover:bg-cyan-700 px-6 py-2 rounded-lg text-white disabled:opacity-50">
              {saving ? 'Сохранение...' : 'Добавить'}
            </button>
          </div>
        </div>
      )}

      {/* Таблица отзывов */}
      {loading ? <div className="text-gray-400">Загрузка...</div> : reviews.length === 0 ? <div className="text-gray-400">Нет отзывов</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-borderLight text-gray-400">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Автор</th>
                <th className="p-3">Текст</th>
                <th className="p-3">Оценка</th>
                <th className="p-3">Фото</th>
                <th className="p-3">На главной</th>
                <th className="p-3">Дата</th>
                <th className="p-3">Ссылка</th>
                <th className="p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} className="border-t border-borderLight">
                  <td className="p-3 text-xs font-mono">{r.id.slice(-6)}</td>
                  <td className="p-3">{r.authorName || (r.user?.name) || 'Анонимно'}</td>
                  <td className="p-3">
                    {editingId === r.id ? (
                      <input value={editText} onChange={e => setEditText(e.target.value)}
                        className="w-full bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-white" />
                    ) : (
                      <span className="line-clamp-2">{r.text}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-0.5">
                      {Array.from({length:5}).map((_,i)=> <Star key={i} size={14} fill={i<r.rating?'#fbbf24':'none'} color={i<r.rating?'#fbbf24':'#9ca3af'} />)}
                    </div>
                  </td>
                  <td className="p-3">{r.images?.length || 0}</td>
                  <td className="p-3">
                    <input type="checkbox" checked={r.featured} onChange={() => toggleFeatured(r.id, r.featured)}
                      className="w-4 h-4 accent-accent" />
                  </td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {editingId === r.id ? (
                      <input value={editSourceUrl} onChange={e => setEditSourceUrl(e.target.value)}
                        className="w-full bg-[#0f2a42] border border-borderLight rounded px-2 py-1 text-white text-xs" />
                    ) : (
                      r.sourceUrl ? <a href={r.sourceUrl} target="_blank" className="text-accent underline text-xs">открыть</a> : '—'
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleModeration(r.id, 'approved')} className="text-green-400"><Check size={18} /></button>
                          <button onClick={() => handleModeration(r.id, 'rejected')} className="text-red-400"><X size={18} /></button>
                        </>
                      )}
                      {r.isExternal && (
                        editingId === r.id ? (
                          <>
                            <button onClick={() => saveEdit(r.id)} className="text-green-400"><Save size={18} /></button>
                            <button onClick={cancelEdit} className="text-red-400"><XCircle size={18} /></button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(r)} className="text-blue-400"><Edit2 size={18} /></button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}