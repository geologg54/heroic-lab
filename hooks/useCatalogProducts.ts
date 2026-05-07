// hooks/useCatalogProducts.ts
// Хук для загрузки товаров с учётом всех активных фильтров, цены, сортировки и пагинации.

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';
import type { FilterState } from '@/components/catalog/FilterPanel';

interface UseCatalogProductsParams {
  page: number;
  sortBy: string;
  currentMin: number;
  currentMax: number;
  globalMinPrice: number;
  globalMaxPrice: number;
  showOnlySale: boolean;
  filters: FilterState;
}

export function useCatalogProducts({
  page, sortBy, currentMin, currentMax,
  globalMinPrice, globalMaxPrice,
  showOnlySale, filters,
}: UseCatalogProductsParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  // Возвращаем актуальные теги, чтобы обновлять список в FilterPanel
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '12');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    // Цена добавляется, только если ползунки сдвинуты
    if (currentMin !== globalMinPrice || currentMax !== globalMaxPrice) {
      params.set('minPrice', currentMin.toString());
      params.set('maxPrice', currentMax.toString());
    }
    if (showOnlySale) params.set('onSale', 'true');

    // Добавляем категории и теги
    filters.categories.forEach(cat => params.append('category', cat));
    filters.tags.forEach(tag => params.append('tags', tag));

    // Обычные фильтры
    if (filters.categories.length > 1 && filters.categoryFilters && Object.keys(filters.categoryFilters).length > 0) {
      // Раздельные фильтры для нескольких категорий
      for (const [slug, catFilters] of Object.entries(filters.categoryFilters)) {
        if (catFilters.filter1?.length) catFilters.filter1.forEach(v => params.append(`cat_${slug}_filter1`, v));
        if (catFilters.filter2?.length) catFilters.filter2.forEach(v => params.append(`cat_${slug}_filter2`, v));
        if (catFilters.filter3?.length) catFilters.filter3.forEach(v => params.append(`cat_${slug}_filter3`, v));
        if (catFilters.filter4?.length) catFilters.filter4.forEach(v => params.append(`cat_${slug}_filter4`, v));
        if (catFilters.filter5?.length) catFilters.filter5.forEach(v => params.append(`cat_${slug}_filter5`, v));
        if (catFilters.scales?.length) catFilters.scales.forEach(v => params.append(`cat_${slug}_scale`, v));
      }
    } else {
      // Обычные фильтры
      filters.filter1.forEach(v => params.append('filter1', v));
      filters.filter2.forEach(v => params.append('filter2', v));
      filters.filter3.forEach(v => params.append('filter3', v));
      filters.filter4.forEach(v => params.append('filter4', v));
      filters.filter5.forEach(v => params.append('filter5', v));
      filters.scales.forEach(v => params.append('scale', v));
    }

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      // Обновляем доступные теги (важно для FilterPanel)
      if (data.availableFilters?.tags) {
        setAvailableTags(data.availableFilters.tags);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, currentMin, currentMax, globalMinPrice, globalMaxPrice, showOnlySale, filters]);

  // Автоматически загружаем при изменении любой зависимости
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, totalPages, loading, availableTags };
}