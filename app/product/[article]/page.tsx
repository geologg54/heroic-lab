// app/product/[article]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MaterialProvider } from '@/components/product/MaterialProvider';
import ProductPageClient from '@/components/product/ProductPageClient';

interface ProductPageProps {
  params: Promise<{ article: string }>;
}

// Безопасно получаем массив тегов (нижний регистр)
function getTagsArray(product: any): string[] {
  if (Array.isArray(product.tags)) {
    return product.tags.map((t: any) => String(t).toLowerCase().trim());
  }
  if (typeof product.tags === 'string') {
    return product.tags.split(',').map((t: any) => t.toLowerCase().trim()).filter(Boolean);
  }
  return [];
}

// Выбрать случайные элементы
function pickRandom(arr: any[], count: number): any[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Собрать все уникальные значения фильтров из массива товаров
function collectFilterValues(products: any[]): {
  filter1: string[];
  filter2: string[];
  filter3: string[];
  filter4: string[];
  filter5: string[];
} {
  const sets: Record<string, Set<string>> = {
    filter1: new Set(),
    filter2: new Set(),
    filter3: new Set(),
    filter4: new Set(),
    filter5: new Set(),
  };
  products.forEach((p: any) => {
    for (const key of ['filter1', 'filter2', 'filter3', 'filter4', 'filter5']) {
      const val = p[key];
      if (val) sets[key].add(val);
    }
  });
  return {
    filter1: Array.from(sets.filter1),
    filter2: Array.from(sets.filter2),
    filter3: Array.from(sets.filter3),
    filter4: Array.from(sets.filter4),
    filter5: Array.from(sets.filter5),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { article } = await params;

  // Текущий товар
  const product = await prisma.product.findUnique({
    where: { article },
    include: { category: true },
  });
  if (!product) notFound();

  // Преобразуем теги текущего товара
  const currentTags = getTagsArray(product);

  // Все товары, кроме текущего
  const allProducts = await prisma.product.findMany({
    where: { article: { not: article } },
    include: { category: true },
  });

  // Товары с ПОЛНЫМ совпадением всех тегов (строгое равенство множеств)
  const exactMatchProducts = allProducts.filter((p: any) => {
    const pTags = getTagsArray(p);
    if (pTags.length !== currentTags.length) return false;
    return currentTags.every(tag => pTags.includes(tag));
  });

  // Берём до 3 случайных товаров с полным совпадением
  const related = pickRandom(exactMatchProducts, 3);

  // Собираем фильтры из этих похожих товаров (чтобы передать в каталог)
  const relatedFilterParams = {
    tags: currentTags,
    ...collectFilterValues(related),
  };

  // Хлебные крошки
  const categoryName = product.category?.name || '';
  const productCatSlug = product.category?.slug || '';

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: categoryName, href: `/catalog?category=${productCatSlug}` },
    { label: product.name },
  ];

  const showMinHeight = product.stock > 1 && product.heightMin != null;

  return (
    <MaterialProvider basePrice={product.price}>
      <ProductPageClient
        product={{
          ...product,
          tags: currentTags,
          images: product.images ? product.images.split(',') : [],
          image: product.images?.split(',')[0] || '',
        } as any}
        related={related.map((p: any) => ({
          ...p,
          tags: getTagsArray(p),
          images: p.images?.split(',') || [],
          image: p.images?.split(',')[0] || '',
        }))}
        relatedFilterParams={relatedFilterParams}
        breadcrumbItems={breadcrumbItems}
        showMinHeight={showMinHeight}
      />
    </MaterialProvider>
  );
}