// hooks/useFilterSections.ts
import { useMemo } from 'react'
import type { FilterState } from '@/components/catalog/FilterPanel'
import type { CategoryFilterGroup } from '@/components/catalog/FilterPanel'

interface UseFilterSectionsParams {
  filters: FilterState
  filterNames?: {
    filter1Name?: string | null
    filter2Name?: string | null
    filter3Name?: string | null
    filter4Name?: string | null
    filter5Name?: string | null
  } | null
  categoryFilterGroups?: CategoryFilterGroup[]
  categoryFilterNames?: {
    [slug: string]: {
      filter1Name?: string | null
      filter2Name?: string | null
      filter3Name?: string | null
      filter4Name?: string | null
      filter5Name?: string | null
    }
  }
  getSectionOptions: (sectionKey: string, categorySlug?: string) => string[]
}

export interface FilterSectionDescriptor {
  key: string
  title: string
  categorySlug?: string
  paginated?: boolean
}

/**
 * Хук возвращает массив объектов-секций для отображения в FilterPanel.
 */
export function useFilterSections({
  filters,
  filterNames,
  categoryFilterGroups = [],
  categoryFilterNames,
  getSectionOptions,
}: UseFilterSectionsParams): FilterSectionDescriptor[] {
  return useMemo(() => {
    const hasCategory = filters.categories.length > 0
    const multiCategory = hasCategory && filters.categories.length > 1

    const sections: FilterSectionDescriptor[] = [
      { key: 'categories', title: 'Категория' },
    ]

    if (hasCategory) {
      if (multiCategory && categoryFilterGroups.length > 0) {
        categoryFilterGroups.forEach((group) => {
          if (group.filter1Name)
            sections.push({
              key: `filter1_${group.categorySlug}`,
              title:
                categoryFilterNames?.[group.categorySlug]?.filter1Name ||
                group.filter1Name ||
                'Фильтр 1',
              categorySlug: group.categorySlug,
            })
          if (group.filter2Name)
            sections.push({
              key: `filter2_${group.categorySlug}`,
              title:
                categoryFilterNames?.[group.categorySlug]?.filter2Name ||
                group.filter2Name ||
                'Фильтр 2',
              categorySlug: group.categorySlug,
            })
          if (group.filter3Name)
            sections.push({
              key: `filter3_${group.categorySlug}`,
              title:
                categoryFilterNames?.[group.categorySlug]?.filter3Name ||
                group.filter3Name ||
                'Фильтр 3',
              categorySlug: group.categorySlug,
            })
          if (group.filter4Name)
            sections.push({
              key: `filter4_${group.categorySlug}`,
              title:
                categoryFilterNames?.[group.categorySlug]?.filter4Name ||
                group.filter4Name ||
                'Фильтр 4',
              categorySlug: group.categorySlug,
            })
          if (group.filter5Name)
            sections.push({
              key: `filter5_${group.categorySlug}`,
              title:
                categoryFilterNames?.[group.categorySlug]?.filter5Name ||
                group.filter5Name ||
                'Фильтр 5',
              categorySlug: group.categorySlug,
            })
        })
        const scalesOpts = getSectionOptions('scales')
        if (scalesOpts.length >= 2) sections.push({ key: 'scales', title: 'Масштаб' })
      } else {
        if (filterNames?.filter1Name) sections.push({ key: 'filter1', title: filterNames.filter1Name! })
        if (filterNames?.filter2Name) sections.push({ key: 'filter2', title: filterNames.filter2Name! })
        if (filterNames?.filter3Name) sections.push({ key: 'filter3', title: filterNames.filter3Name! })
        if (filterNames?.filter4Name) sections.push({ key: 'filter4', title: filterNames.filter4Name! })
        if (filterNames?.filter5Name) sections.push({ key: 'filter5', title: filterNames.filter5Name! })
        const scalesOpts = getSectionOptions('scales')
        if (scalesOpts.length >= 2) sections.push({ key: 'scales', title: 'Масштаб' })
      }
    }

    sections.push({ key: 'tags', title: 'Теги', paginated: true })
    return sections
  }, [filters.categories, filterNames, categoryFilterGroups, categoryFilterNames, getSectionOptions])
}