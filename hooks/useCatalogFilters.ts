// hooks/useCatalogFilters.ts
// Хук управляет всеми фильтрами каталога и загружает статические опции при смене категорий.

import { useState, useCallback, useMemo } from 'react';
import type { FilterState } from '@/components/catalog/FilterPanel';

export interface StaticFilterOptions {
  categories: string[];
  filter1: string[];
  filter2: string[];
  filter3: string[];
  filter4: string[];
  filter5: string[];
  scales: string[];
}

export interface CategoryWithFilters {
  slug: string;
  filter1Name?: string | null;
  filter2Name?: string | null;
  filter3Name?: string | null;
  filter4Name?: string | null;
  filter5Name?: string | null;
}

export interface CategoryFilterGroup {
  categorySlug: string;
  categoryName: string;
  filter1Name?: string | null;
  filter2Name?: string | null;
  filter3Name?: string | null;
  filter4Name?: string | null;
  filter5Name?: string | null;
}

export interface CategoryFilterOptions {
  [slug: string]: {
    filter1: string[];
    filter2: string[];
    filter3: string[];
    filter4: string[];
    filter5: string[];
    scales: string[];
  };
}

export interface CategoryFilterNames {
  [slug: string]: {
    filter1Name?: string | null;
    filter2Name?: string | null;
    filter3Name?: string | null;
    filter4Name?: string | null;
    filter5Name?: string | null;
  };
}

export function useCatalogFilters(
  initialFilters: FilterState,
  categoriesData: CategoryWithFilters[],
  categoryNames: Record<string, string>
) {
  // ----- СОСТОЯНИЕ ФИЛЬТРОВ -----
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // ----- ОПЦИИ ФИЛЬТРОВ -----
  const [staticFilterOptions, setStaticFilterOptions] = useState<StaticFilterOptions>({
    categories: Object.keys(categoryNames),
    filter1: [],
    filter2: [],
    filter3: [],
    filter4: [],
    filter5: [],
    scales: [],
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filterNames, setFilterNames] = useState<Record<string, string | null> | undefined>(undefined);
  const [categoryFilterGroups, setCategoryFilterGroups] = useState<CategoryFilterGroup[]>([]);
  const [categoryFilterOptions, setCategoryFilterOptions] = useState<CategoryFilterOptions>({});
  const [categoryFilterNames, setCategoryFilterNames] = useState<CategoryFilterNames>({});

  // ----- ЗАГРУЗКА ОПЦИЙ С СЕРВЕРА -----
  const fetchStaticFilters = useCallback(async (categorySlugs?: string[]) => {
    try {
      if (!categorySlugs || categorySlugs.length === 0) {
        setStaticFilterOptions(prev => ({
          ...prev,
          filter1: [], filter2: [], filter3: [], filter4: [], filter5: [], scales: []
        }));
        setAvailableTags([]);
        setFilterNames(undefined);
        setCategoryFilterGroups([]);
        setCategoryFilterOptions({});
        setCategoryFilterNames({});
        return;
      }

      const params = new URLSearchParams();
      categorySlugs.forEach(slug => params.append('category', slug));
      if (categorySlugs.length > 1) {
        params.set('separate', 'true');
      }

      const res = await fetch(`/api/filters?${params.toString()}`);
      const data = await res.json();
      if (!data) return;

      if (categorySlugs.length > 1 && data.categoryFilters) {
        setCategoryFilterOptions(data.categoryFilters);
        setCategoryFilterNames(data.filterNames || {});
        setAvailableTags(data.tags || []);
        setFilterNames(undefined);

        const groups: CategoryFilterGroup[] = categorySlugs
          .map(slug => {
            const cat = categoriesData.find(c => c.slug === slug);
            if (!cat) return null;
            return {
              categorySlug: slug,
              categoryName: categoryNames[slug] || slug,
              filter1Name: cat.filter1Name,
              filter2Name: cat.filter2Name,
              filter3Name: cat.filter3Name,
              filter4Name: cat.filter4Name,
              filter5Name: cat.filter5Name,
            };
          })
          .filter(Boolean) as CategoryFilterGroup[];
        setCategoryFilterGroups(groups);
      } else {
        setStaticFilterOptions(prev => ({
          ...prev,
          filter1: data.filter1 || [],
          filter2: data.filter2 || [],
          filter3: data.filter3 || [],
          filter4: data.filter4 || [],
          filter5: data.filter5 || [],
          scales: data.scales || [],
        }));
        setAvailableTags(data.tags || []);
        setFilterNames(data.filterNames || undefined);
        setCategoryFilterGroups([]);
        setCategoryFilterOptions({});
        setCategoryFilterNames({});
      }
    } catch (error) {
      console.error('Ошибка загрузки фильтров:', error);
    }
  }, [categoriesData, categoryNames]);

  // ----- ПЕРЕКЛЮЧЕНИЕ ФИЛЬТРА -----
  const toggleFilter = useCallback(
    (key: string, value: string, categorySlug?: string) => {
      setFilters(prev => {
        if (prev.categories.length > 1 && categorySlug) {
          const currentCatFilters = prev.categoryFilters || {};
          const catFilter = currentCatFilters[categorySlug] || {};
          const field = key as keyof typeof catFilter;
          let currentValues = catFilter[field];
          if (!Array.isArray(currentValues)) currentValues = [];
          const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
          return {
            ...prev,
            categoryFilters: {
              ...currentCatFilters,
              [categorySlug]: { ...catFilter, [field]: newValues },
            },
          };
        } else {
          const currentValues = (prev as any)[key] as string[] | undefined;
          const arr = Array.isArray(currentValues) ? currentValues : [];
          const newValues = arr.includes(value)
            ? arr.filter(v => v !== value)
            : [...arr, value];
          return { ...prev, [key]: newValues };
        }
      });
    },
    []
  );

  // ----- СБРОС -----
  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
      tags: [], scales: [],
      gameSystems: [], factions: [], types: [], fileFormats: [],
      categoryFilters: {},
    });
    fetchStaticFilters();
  }, [fetchStaticFilters]);

  // ----- ПОЛУЧЕНИЕ ОПЦИЙ ДЛЯ СЕКЦИЙ -----
  const getSectionOptions = useCallback(
    (sectionKey: string, categorySlug?: string): string[] => {
      if (categorySlug && categoryFilterOptions[categorySlug]) {
        if (sectionKey.startsWith('filter')) {
          const field = sectionKey.split('_')[0] as keyof typeof categoryFilterOptions[string];
          return categoryFilterOptions[categorySlug][field] || [];
        }
        if (sectionKey === 'scales') {
          return categoryFilterOptions[categorySlug].scales || [];
        }
      }
      if (sectionKey === 'tags') return availableTags;
      return (staticFilterOptions as any)[sectionKey] || [];
    },
    [availableTags, staticFilterOptions, categoryFilterOptions]
  );

  // ----- КОЛИЧЕСТВО АКТИВНЫХ ФИЛЬТРОВ -----
  const activeFiltersCount =
    filters.categories.length +
    filters.filter1.length +
    filters.filter2.length +
    filters.filter3.length +
    filters.filter4.length +
    filters.filter5.length +
    filters.tags.length +
    filters.scales.length;

  return {
    filters,
    setFilters,                 // <-- теперь экспортируется
    toggleFilter,
    resetFilters,
    fetchStaticFilters,
    getSectionOptions,
    activeFiltersCount,
    staticFilterOptions,
    availableTags,
    setAvailableTags,
    filterNames,
    categoryFilterGroups,
    categoryFilterOptions,
    categoryFilterNames,
  };
}