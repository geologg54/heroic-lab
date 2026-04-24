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

  const related = allProducts
    .filter((p) => {
      const catSlug = typeof p.category === 'object' ? p.category.slug : p.categorySlug;
      return catSlug === productCatSlug && p.article !== product.article;
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