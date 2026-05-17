// hooks/useCatalogProducts.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const filtersSerialized = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '12');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentMin !== globalMinPrice || currentMax !== globalMaxPrice) {
      params.set('minPrice', currentMin.toString());
      params.set('maxPrice', currentMax.toString());
    }
    if (showOnlySale) params.set('onSale', 'true');

    filters.categories.forEach(cat => params.append('category', cat));
    filters.tags.forEach(tag => params.append('tags', tag));

    for (let i = 1; i <= 15; i++) {
      const key = `filter${i}` as keyof FilterState;
      const values = filters[key] as string[];
      if (values && values.length > 0) {
        values.forEach(v => params.append(key, v));
      }
    }

    filters.scales.forEach(v => params.append('scale', v));

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, currentMin, currentMax, globalMinPrice, globalMaxPrice, showOnlySale, filtersSerialized]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, totalPages, loading };
}