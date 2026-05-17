// components/product/ProductTagsGrouped.tsx
'use client'
import Link from 'next/link'

interface FilterConfigItem {
  filterField: string;
  title: string;
  parentField?: string | null;
  parentValue?: string | null;
  categorySlug?: string;
}

export default function ProductTagsGrouped({ product, filterConfig }: { product: any; filterConfig: FilterConfigItem[] }) {
  if (!filterConfig.length) return null;

  const fieldMap = new Map<string, FilterConfigItem>();
  for (const item of filterConfig) {
    fieldMap.set(item.filterField, item);
  }

  const buildUrl = (field: string, value: string): string => {
    const params = new URLSearchParams();
    const addParents = (currentField: string, currentValue: string) => {
      const config = fieldMap.get(currentField);
      if (config?.parentField && config.parentValue) {
        // Используем parentValue из конфигурации, а не все значения из товара
        addParents(config.parentField, config.parentValue);
      }
      params.append(currentField, currentValue);
    };
    addParents(field, value);
    const categorySlug = product.category?.slug || product.categorySlug || '';
    if (categorySlug) params.append('category', categorySlug);
    return `/catalog?${params.toString()}`;
  };

  const groups: { title: string; values: { value: string; url: string }[] }[] = [];

  const categoryName = product.category?.name || product.categoryName || '';
  const categorySlug = product.category?.slug || product.categorySlug || '';
  if (categoryName && categorySlug) {
    groups.push({
      title: 'Категория',
      values: [{ value: categoryName, url: `/catalog?category=${encodeURIComponent(categorySlug)}` }],
    });
  }

  const filterFields = ['filter1','filter2','filter3','filter4','filter5','filter6','filter7','filter8','filter9','filter10','filter11','filter12','filter13','filter14','filter15'];
  for (const field of filterFields) {
    const rawValue = product[field];
    if (!rawValue) continue;
    const config = fieldMap.get(field);
    if (!config) continue;
    const title = config.title;
    const values = rawValue.split(',').map((v: string) => v.trim()).filter((v: string) => Boolean(v));
    if (values.length === 0) continue;
    groups.push({
      title,
      values: values.map((v: string) => ({ value: v, url: buildUrl(field, v) })),
    });
  }

  if (groups.length === 0) return null;

  return (
    <div className="sticky top-24 z-30 space-y-4">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">{group.title}</h3>
          <div className="flex flex-wrap gap-2">
            {group.values.map(({ value, url }) => (
              <Link
                key={value}
                href={url}
                className="px-3 py-1 rounded-full border border-white text-white bg-transparent hover:bg-white hover:text-darkbg transition-colors text-sm"
              >
                {value}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}