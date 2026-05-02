// components/catalog/Pagination.tsx
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  onPageChangeWithScroll,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageChangeWithScroll?: (page: number) => void;
}) {
  const scrollHandler = onPageChangeWithScroll || onPageChange;
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [inputPage, setInputPage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedPage, setHighlightedPage] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Предыдущая страница, чтобы не центрировать при первом рендере
  const prevPageRef = useRef(currentPage);

  // Управление анимацией подсказки (два плавных качания)
  const [hintPhase, setHintPhase] = useState(0);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Функция для программного центрирования активной кнопки в ленте
  const centerActiveButton = useCallback(() => {
    const container = scrollContainerRef.current;
    const btn = activeButtonRef.current;
    if (!container || !btn) return;
    const containerWidth = container.offsetWidth;
    const btnLeft = btn.offsetLeft;
    const btnWidth = btn.offsetWidth;
    // Желаемая позиция скролла: кнопка по центру
    const targetScroll = btnLeft - containerWidth / 2 + btnWidth / 2;
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, []);

  // При изменении currentPage центрируем, только если это не первый рендер
  useEffect(() => {
    if (isMobile && prevPageRef.current !== currentPage) {
      centerActiveButton();
    }
    prevPageRef.current = currentPage;
  }, [currentPage, isMobile, centerActiveButton]);

  // Подсказка при первом появлении контейнера в зоне видимости
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!isMobile || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Первый цикл анимации
          setHintPhase(1);
          hintTimerRef.current = setTimeout(() => {
            setHintPhase(0);
            // Пауза 200 мс, потом второй цикл
            hintTimerRef.current = setTimeout(() => {
              setHintPhase(1);
              hintTimerRef.current = setTimeout(() => {
                setHintPhase(0);
              }, 600);
            }, 200);
          }, 600);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [isMobile]);

  const triggerHighlight = useCallback((page: number) => {
    setHighlightedPage(page);
    setTimeout(() => setHighlightedPage(null), 600);
  }, []);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    triggerHighlight(page);
  };

  const goToPageWithScroll = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    scrollHandler(page);
    triggerHighlight(page);
  };

  // Прокрутка ленты блоками по 5 страниц
  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const step = 5 * 36;
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const scrollToStart = () => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ left: 0, behavior: 'smooth' });
  };
  const scrollToEnd = () => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
  };

  // Обработчик поля ввода: просто скроллим ленту и подсвечиваем, БЕЗ перехода
  const handleInputSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const num = parseInt(inputPage, 10);
    if (isNaN(num) || num < 1 || num > totalPages) return;
    setInputPage('');

    // Ищем кнопку с этим номером в ленте (только для мобильной версии)
    if (scrollContainerRef.current) {
      const buttons = scrollContainerRef.current.querySelectorAll('button');
      buttons.forEach((btn) => {
        if (btn.textContent === num.toString()) {
          // Скроллим к ней
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          // Подсвечиваем
          triggerHighlight(num);
        }
      });
    }
    // На десктопе тоже подсветим (там кнопка может быть не видна, но подсветка сработает)
    triggerHighlight(num);
  };

  // Десктоп
  const maxVisibleDesktop = 10;
  const [desktopVisibleStart, setDesktopVisibleStart] = useState(1);
  const desktopVisibleEnd = Math.min(desktopVisibleStart + maxVisibleDesktop - 1, totalPages);
  const desktopPages = Array.from({ length: desktopVisibleEnd - desktopVisibleStart + 1 }, (_, i) => desktopVisibleStart + i);

  useEffect(() => {
    const half = Math.floor(maxVisibleDesktop / 2);
    let newStart = currentPage - half;
    if (newStart < 1) newStart = 1;
    if (newStart + maxVisibleDesktop - 1 > totalPages) newStart = Math.max(1, totalPages - maxVisibleDesktop + 1);
    setDesktopVisibleStart(newStart);
  }, [currentPage, totalPages, maxVisibleDesktop]);

  const handlePrevBlockDesktop = () => setDesktopVisibleStart(prev => Math.max(1, prev - maxVisibleDesktop));
  const handleNextBlockDesktop = () => setDesktopVisibleStart(prev => Math.min(totalPages - maxVisibleDesktop + 1, prev + maxVisibleDesktop));

  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-2">
      <nav className="flex items-center justify-center gap-1 flex-wrap">
        {!isMobile ? (
          <>
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md text-gray-400 hover:text-white disabled:opacity-30" title="Первая страница">
              <ChevronsLeft size={16} />
            </button>
            <button onClick={handlePrevBlockDesktop} disabled={desktopVisibleStart <= 1} className="p-1.5 rounded-md text-gray-400 hover:text-white disabled:opacity-30" title="Предыдущие страницы">
              <ChevronLeft size={16} />
            </button>

            {desktopPages.map(p => (
              <button
                key={p}
                onClick={() => goToPageWithScroll(p)}
                className={`min-w-[2.5rem] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                  p === currentPage ? 'border border-white text-white' : 'text-gray-300 hover:bg-white/10'
                } ${highlightedPage === p ? 'bg-white/20' : ''}`}
              >
                {p}
              </button>
            ))}

            <button onClick={handleNextBlockDesktop} disabled={desktopVisibleEnd >= totalPages} className="p-1.5 rounded-md text-gray-400 hover:text-white disabled:opacity-30" title="Следующие страницы">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md text-gray-400 hover:text-white disabled:opacity-30" title="Последняя страница">
              <ChevronsRight size={16} />
            </button>
          </>
        ) : (
          <>
            <button onClick={scrollToStart} className="p-1 rounded-md text-gray-400 hover:text-white" title="В начало">
              <ChevronsLeft size={14} />
            </button>
            <button onClick={() => scrollBy('left')} className="p-1 rounded-md text-gray-400 hover:text-white" title="Предыдущие">
              <ChevronLeft size={14} />
            </button>

            <div
              ref={scrollContainerRef}
              className={`overflow-x-auto scrollbar-hide flex mx-0.5 snap-x snap-mandatory scroll-smooth ${
                hintPhase === 1 ? 'animate-hint-shake' : ''
              }`}
              style={{
                maxWidth: '55vw',
                gap: '2px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {allPages.map(p => (
                <button
                  key={p}
                  ref={p === currentPage ? activeButtonRef : null}
                  onClick={() => goToPageWithScroll(p)}
                  style={{ minWidth: '2rem', padding: '0.375rem 0.25rem' }}
                  className={`snap-center rounded-md text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
                    p === currentPage ? 'border border-white text-white' : 'text-gray-300 hover:bg-white/10'
                  } ${highlightedPage === p ? 'bg-white/20' : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button onClick={() => scrollBy('right')} className="p-1 rounded-md text-gray-400 hover:text-white" title="Следующие">
              <ChevronRight size={14} />
            </button>
            <button onClick={scrollToEnd} className="p-1 rounded-md text-gray-400 hover:text-white" title="В конец">
              <ChevronsRight size={14} />
            </button>
          </>
        )}
      </nav>

      {/* Поле ввода номера страницы (увеличено, без иконки) */}
      <form onSubmit={handleInputSubmit} className="flex items-center gap-1 mt-2">
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={totalPages}
          placeholder="ввести номер страницы"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-56 px-3 py-2 text-sm bg-[#0f2a42] border border-borderLight rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </form>
    </div>
  );
}