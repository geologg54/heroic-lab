// app/product/[article]/page.tsx
import { notFound } from 'next/navigation';
import { getProductByArticle, getProducts } from '@/lib/db';
import { MaterialProvider } from '@/components/product/MaterialProvider';
import ProductPageClient from '@/components/product/ProductPageClient';

interface ProductPageProps {
  params: Promise<{ article: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { article } = await params;

  const product = await getProductByArticle(article);
  if (!product) notFound();

  const allProducts = await getProducts();
  const productCatSlug =
    typeof product.category === 'object' ? product.category.slug : product.categorySlug;

  // product.tags уже массив строк (парсится в getProductByArticle)
  const productTags = product.tags.map(t => t.toLowerCase());

  // Подбираем до 3 товаров, у которых есть хотя бы один общий тег с текущим товаром
  const related = allProducts
    .filter((p) => {
      if (p.article === product.article) return false;
      const pTags = p.tags.map(t => t.toLowerCase());
      return productTags.some(tag => pTags.includes(tag));
    })
    .slice(0, 3);

  const categoryName =
    typeof product.category === 'object'
      ? product.category.name
      : product.categoryName || product.category;

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
        product={product}
        related={related}
        breadcrumbItems={breadcrumbItems}
        showMinHeight={showMinHeight}
      />
    </MaterialProvider>
  );
}