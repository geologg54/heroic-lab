// components/reviews/ReviewCard.tsx
'use client';
import { useState } from 'react';
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

  const nextImage = () => setCurrentImage(prev => (prev + 1) % review.images.length);
  const prevImage = () => setCurrentImage(prev => (prev - 1 + review.images.length) % review.images.length);

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} fill={i < count ? '#fbbf24' : 'none'} color={i < count ? '#fbbf24' : '#9ca3af'} />
    ));

  const imageContainer = (src: string) => (
    <div className="relative w-full aspect-square bg-gray-800 overflow-hidden rounded-lg">
      <Image src={src} alt="Фото отзыва" fill className="object-cover" />
    </div>
  );

  return (
    <div className={`bg-cardbg border border-borderLight rounded-xl p-4 flex flex-col ${review.isPending ? 'opacity-60' : ''}`}>
      {review.isPending && (
        <div className="mb-2 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full self-start">
          На модерации
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-0.5">{renderStars(review.rating)}</div>
        <span className="text-gray-400 text-sm">{review.authorName || 'Анонимно'}</span>
      </div>
      {review.orderNumber && (
        <div className="text-xs text-gray-500 mb-2">
          Заказ №{review.orderNumber}{' '}
          {review.orderDate && `от ${new Date(review.orderDate).toLocaleDateString('ru-RU')}`}
        </div>
      )}
      {review.images.length > 0 && (
        <div className="relative mb-3">
          {review.sourceUrl ? (
            <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">
              {imageContainer(review.images[currentImage])}
            </a>
          ) : (
            imageContainer(review.images[currentImage])
          )}
          {review.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {review.images.map((_, idx) => (
                  <span key={idx} className={`w-2 h-2 rounded-full ${idx === currentImage ? 'bg-white' : 'bg-gray-500'}`}></span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <p className="text-gray-300 text-sm flex-1">{review.text}</p>
      {review.isOwner && onEdit && (
        <button onClick={onEdit} className="mt-2 text-xs text-blue-400 hover:text-blue-300 self-end">
          Редактировать
        </button>
      )}
    </div>
  );
}