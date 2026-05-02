// app/reviews/page.tsx
'use client';
import { useEffect, useState } from 'react';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import Pagination from '@/components/catalog/Pagination';
import { useSession } from 'next-auth/react';

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const fetchReviews = () => {
    setLoading(true);
    fetch(`/api/reviews?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleSuccess = (newReview: any) => {
    if (editingReview) {
      setReviews(prev => prev.map(r => r.id === newReview.id ? newReview : r));
      setEditingReview(null);
    } else {
      setReviews(prev => [newReview, ...prev]);
    }
  };

  const startEdit = (review: any) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Отзывы</h1>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                isOwner: session?.user?.id === review.userId,
              }}
              onEdit={() => startEdit(review)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mb-12">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={(p) => { setPage(p); window.scrollTo(0,0); }}
          />
        </div>
      )}

      <div className="text-center mb-16">
        <button
          onClick={() => { setEditingReview(null); setIsFormOpen(true); }}
          className="border border-gray-400 hover:bg-white hover:text-darkbg hover:border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
        >
          Оставить отзыв
        </button>
      </div>

      <ReviewForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingReview(null); }}
        onSuccess={handleSuccess}
        editingReview={editingReview}
      />
    </div>
  );
}