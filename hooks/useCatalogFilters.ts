// hooks/useCatalogFilters.ts
import { useState, useCallback, useEffect } from 'react';
import type { FilterState } from '@/components/catalog/FilterPanel';

export interface FilterConfigItem {
  key: string;
  title: string;
  field: string;   // filter1..15 или scale
  type: 'static' | 'dynamic';
  parentField: string | null;
  parentValue: string | null;
  categorySlug?: string;
}

interface FilterConfigRaw {
  id: string;
  categorySlug: string;
  filterField: string;
  title: string;
  type: 'static' | 'dynamic';
  parentField: string | null;
  parentValue: string | null;
  sortOrder: number;
}

export function useCatalogFilters(
  initialFilters: FilterState,
  categoriesData: any[],
  categoryNames: Record<string, string>
) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [filterConfigSections, setFilterConfigSections] = useState<FilterConfigItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [filterCounts, setFilterCounts] = useState<Record<string, Record<string, number>>>({
    filter1: {}, filter2: {}, filter3: {}, filter4: {}, filter5: {},
    filter6: {}, filter7: {}, filter8: {}, filter9: {}, filter10: {},
    filter11: {}, filter12: {}, filter13: {}, filter14: {}, filter15: {},
    scales: {}
  });
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/filters?includeCounts=true');
      const data = await res.json();
      if (data) {
        setCategoryCounts(data.categoryCounts || {});
        setFilterCounts(data.filterCounts || {
          filter1: {}, filter2: {}, filter3: {}, filter4: {}, filter5: {},
          filter6: {}, filter7: {}, filter8: {}, filter9: {}, filter10: {},
          filter11: {}, filter12: {}, filter13: {}, filter14: {}, filter15: {},
          scales: {}
        });
        setTagCounts(data.tagCounts || {});
      }
    } catch (error) {
      console.error('Ошибка загрузки счётчиков:', error);
    }
  }, []);


  const fetchFilterConfig = useCallback(async (categorySlugs: string[]) => {
    try {
      if (categorySlugs.length === 0) {
        setFilterConfigSections([]);
        setAvailableTags([]);
        return;
      }

      const allConfigs: FilterConfigRaw[] = [];
      for (const slug of categorySlugs) {
        const res = await fetch(`/api/filter-config?category=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          allConfigs.push(...data);
        }
      }

      const sections: FilterConfigItem[] = [];
      for (const config of allConfigs) {
        sections.push({
          key: categorySlugs.length > 1 ? `${config.filterField}_${config.categorySlug}` : config.filterField,
          title: config.title,
          field: config.filterField,
          type: config.type,
          parentField: config.parentField ? config.parentField.replace(/\s/g, '') : null, // <-- убираем пробелы
          parentValue: config.parentValue,
          categorySlug: categorySlugs.length > 1 ? config.categorySlug : undefined,
        });
      }

      setFilterConfigSections(sections);
      setAvailableTags([]);
    } catch (error) {
      console.error('Ошибка загрузки конфигурации фильтров:', error);
    }
  }, []);

  useEffect(() => {
    fetchFilterConfig(filters.categories);
  }, [filters.categories, fetchFilterConfig]);

  const toggleFilter = useCallback(
    (key: string, value: string, categorySlug?: string) => {
      setFilters(prev => {
        if (prev.categories.length > 1 && categorySlug) {
          const currentCatFilters = prev.categoryFilters || {};
          const catFilter = { ...currentCatFilters[categorySlug] } as any;
          const currentValues = catFilter[key] || [];
          const newValues = currentValues.includes(value)
            ? currentValues.filter((v: string) => v !== value)
            : [...currentValues, value];
          return {
            ...prev,
            categoryFilters: {
              ...currentCatFilters,
              [categorySlug]: { ...catFilter, [key]: newValues },
            },
          };
        } else {
          const currentValues = (prev as any)[key] || [];
          const newValues = currentValues.includes(value)
            ? currentValues.filter((v: string) => v !== value)
            : [...currentValues, value];
          return { ...prev, [key]: newValues };
        }
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
      filter6: [], filter7: [], filter8: [], filter9: [], filter10: [],
      filter11: [], filter12: [], filter13: [], filter14: [], filter15: [],
      tags: [], scales: [],
      gameSystems: [], factions: [], types: [], fileFormats: [],
      categoryFilters: {},
    });
    fetchFilterConfig([]);
  }, [fetchFilterConfig]);

  const getSectionOptions = useCallback(
    (sectionKey: string, categorySlug?: string): string[] => {
      return [];
    },
    []
  );

  const activeFiltersCount =
    filters.categories.length +
    filters.filter1.length + filters.filter2.length + filters.filter3.length + filters.filter4.length + filters.filter5.length +
    filters.filter6.length + filters.filter7.length + filters.filter8.length + filters.filter9.length + filters.filter10.length +
    filters.filter11.length + filters.filter12.length + filters.filter13.length + filters.filter14.length + filters.filter15.length +
    filters.tags.length + filters.scales.length;

  return {
    filters,
    setFilters,
    toggleFilter,
    resetFilters,
    filterConfigSections,
    availableTags,
    getSectionOptions,
    activeFiltersCount,
    categoryCounts,
    filterCounts,
    tagCounts,
  };
}