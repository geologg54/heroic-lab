// components/reviews/ReviewCard.tsx
'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface ReviewData {
  id: string;
  rating: number;
  text: string;
  authorName?: string | null;
  images: string[];
  sourceUrl?: string | null;
  isExternal?: boolean;
  isPending?: boolean;
  orderNumber?: string | null;
  orderDate?: string | null;
  isOwner?: boolean;
  onEdit?: () => void;
}

export default function ReviewCard({ review, onEdit }: { review: ReviewData; onEdit?: () => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swipe left -> next
        setCurrentImage((prev) => (prev + 1) % review.images.length);
      } else {
        // swipe right -> previous
        setCurrentImage((prev) => (prev - 1 + review.images.length) % review.images.length);
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % review.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + review.images.length) % review.images.length);

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < count ? '#fbbf24' : 'none'}
        color={i < count ? '#fbbf24' : '#9ca3af'}
      />
    ));

  const imageContainer = (src: string) => (
    <div className="relative w-full aspect-square bg-gray-800 overflow-hidden rounded-lg">
      <Image src={src} alt="Фото отзыва" fill className="object-cover" />
    </div>
  );

  return (
    <div className="p-4 flex flex-col">
      {review.isPending && (
        <div className="mb-2 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full self-start">
          На модерации
        </div>
      )}

      {/* Звёзды */}
      <div className="flex gap-0.5 mb-1">{renderStars(review.rating)}</div>

      {/* Имя и детали заказа */}
      <div className="flex flex-col gap-0.5 mb-2 min-h-[3rem]">
        <span className="text-gray-400 text-sm truncate">
          {review.authorName || 'Анонимно'}
        </span>
        {review.orderNumber && (
          <span className="text-xs text-gray-500 truncate">
            Заказ №{review.orderNumber}
            {review.orderDate &&
              ` от ${new Date(review.orderDate).toLocaleDateString('ru-RU')}`}
          </span>
        )}
      </div>

      {/* Изображения с поддержкой свайпа */}
      {review.images.length > 0 && (
        <div
          className="relative mb-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {review.sourceUrl ? (
            <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">
              {imageContainer(review.images[currentImage])}
            </a>
          ) : (
            imageContainer(review.images[currentImage])
          )}
          {review.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 z-10"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {review.images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === currentImage ? 'bg-white' : 'bg-gray-500'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Текст отзыва (обрезаем до 4 строк) */}
      <p className="text-gray-300 text-sm line-clamp-4">{review.text}</p>

      {review.isOwner && onEdit && (
        <button
          onClick={onEdit}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300 self-end"
        >
          Редактировать
        </button>
      )}
    </div>
  );
}