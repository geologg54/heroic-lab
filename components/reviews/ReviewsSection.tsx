// components/reviews/ReviewsSection.tsx
'use client';
import { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';
import Link from 'next/link';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnsCount, setColumnsCount] = useState(5); // дефолт для SSR

  // Определяем число колонок по ширине экрана
  const updateColumns = () => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w >= 1280) setColumnsCount(5);       // xl
    else if (w >= 1024) setColumnsCount(4);  // lg
    else if (w >= 640) setColumnsCount(3);   // sm
    else setColumnsCount(2);                 // mobile
  };

  useEffect(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/reviews?featured=true&limit=20')
      .then(res => res.json())
      .then(data => {
        const random = [...(data.reviews || [])].sort(() => 0.5 - Math.random());
        setReviews(random.slice(0, columnsCount));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [columnsCount]);

  return (
    <section className="bg-darkbg py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Отзывы</h2>
        <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
          Оставьте отзыв и получите промокод на следующую покупку
        </p>

        {loading ? (
          <div className="text-center text-gray-400 py-10">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/reviews"
            className="inline-block border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            Все отзывы
          </Link>
        </div>
      </div>
    </section>
  );
}