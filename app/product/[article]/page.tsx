// app/product/[article]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MaterialProvider } from '@/components/product/MaterialProvider';
import ProductPageClient, { type RelatedFilterParams } from '@/components/product/ProductPageClient';

interface ProductPageProps {
  params: Promise<{ article: string }>;
}

function getTagsArray(product: any): string[] {
  if (Array.isArray(product.tags)) {
    return product.tags.map((t: any) => String(t).toLowerCase().trim());
  }
  if (typeof product.tags === 'string') {
    return product.tags.split(',').map((t: any) => t.toLowerCase().trim()).filter(Boolean);
  }
  return [];
}

function similarityScore(a: any, b: any): number {
  let score = 0;
  if (a.categoryId === b.categoryId) score += 10000;
  const filterFields = ['filter1','filter2','filter3','filter4','filter5','filter6','filter7','filter8','filter9','filter10','filter11','filter12','filter13','filter14','filter15'];
  const baseWeight = 5000;
  for (let i = 0; i < filterFields.length; i++) {
    const field = filterFields[i];
    const valA = a[field];
    const valB = b[field];
    if (valA && valB && valA === valB) {
      score += baseWeight - i * 300;
      if (score <= 0) score = 100;
    }
  }
  if (a.scale && b.scale && a.scale === b.scale) score += 50;
  const tagsA = getTagsArray(a);
  const tagsB = getTagsArray(b);
  const commonTags = tagsA.filter(t => tagsB.includes(t)).length;
  score += commonTags * 10;
  return score;
}

function findRelatedProducts(currentProduct: any, allProducts: any[]): any[] {
  const scored = allProducts
    .map(p => ({ product: p, score: similarityScore(currentProduct, p) }))
    .filter(item => item.score > 0);
  const groups = new Map<number, any[]>();
  for (const item of scored) {
    if (!groups.has(item.score)) groups.set(item.score, []);
    groups.get(item.score)!.push(item.product);
  }
  const sortedScores = Array.from(groups.keys()).sort((a, b) => b - a);
  const result: any[] = [];
  for (const score of sortedScores) {
    const candidates = groups.get(score)!;
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    result.push(...candidates);
    if (result.length >= 3) break;
  }
  return result.slice(0, 3);
}

function collectFilterValues(products: any[]): RelatedFilterParams {
  const result: RelatedFilterParams = {
    tags: [],
    filter1: [], filter2: [], filter3: [], filter4: [], filter5: [],
    filter6: [], filter7: [], filter8: [], filter9: [], filter10: [],
    filter11: [], filter12: [], filter13: [], filter14: [], filter15: [],
  };
  const filterFields = ['filter1','filter2','filter3','filter4','filter5','filter6','filter7','filter8','filter9','filter10','filter11','filter12','filter13','filter14','filter15'];
  for (const field of filterFields) {
    const set = new Set<string>();
    for (const p of products) {
      const val = p[field];
      if (val) set.add(val);
    }
    // Используем утверждение типа, т.к. TypeScript не знает, что field — ключ result
    (result as any)[field] = Array.from(set);
  }
  const tagsSet = new Set<string>();
  for (const p of products) {
    getTagsArray(p).forEach(t => tagsSet.add(t));
  }
  result.tags = Array.from(tagsSet);
  return result;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { article } = await params;

  const product = await prisma.product.findUnique({
    where: { article },
    include: { category: true },
  });
  if (!product) notFound();

  const filterConfig = await prisma.filterConfig.findMany({
    where: { categorySlug: product.category?.slug || '' },
    orderBy: { sortOrder: 'asc' },
  });

  const allProducts = await prisma.product.findMany({
    where: { article: { not: article } },
    include: { category: true },
  });

  const related = findRelatedProducts(product, allProducts);

  const allForButton = [product, ...related];
  const relatedFilterParams = collectFilterValues(allForButton);

  const categoryName = product.category?.name || '';
  const productCatSlug = product.category?.slug || '';

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: categoryName, href: `/catalog?category=${productCatSlug}` },
    { label: product.name },
  ];

  const showMinHeight = product.stock > 1 && product.heightMin != null;

  const formattedProduct = {
    ...product,
    tags: getTagsArray(product),
    images: product.images ? product.images.split(',') : [],
    image: product.images?.split(',')[0] || '',
  };

  const formattedRelated = related.map(p => ({
    ...p,
    tags: getTagsArray(p),
    images: p.images?.split(',') || [],
    image: p.images?.split(',')[0] || '',
  }));

  return (
    <MaterialProvider basePrice={product.price}>
      <ProductPageClient
        product={formattedProduct as any}
        related={formattedRelated}
        relatedFilterParams={relatedFilterParams}
        breadcrumbItems={breadcrumbItems}
        showMinHeight={showMinHeight}
        filterConfig={filterConfig}
      />
    </MaterialProvider>
  );
}