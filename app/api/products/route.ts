// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit

  const selectedCategories = searchParams.getAll('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'default'
  const articlesParam = searchParams.get('articles')
  const onSale = searchParams.get('onSale') === 'true'
  const similarTo = searchParams.get('similarTo')

  const filterValues: Record<string, string[]> = {}
  for (let i = 1; i <= 15; i++) {
    const key = `filter${i}`
    filterValues[key] = searchParams.getAll(key)
  }
  const tagsVals = searchParams.getAll('tags')
  const scalesVals = searchParams.getAll('scale')

  const where: any = {}

  if (articlesParam) {
    const articles = articlesParam.split(',').map(a => a.trim()).filter(Boolean)
    if (articles.length > 0) where.article = { in: articles }
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseInt(minPrice)
    if (maxPrice) where.price.lte = parseInt(maxPrice)
  }
  if (search) where.searchName = { contains: search.toLowerCase() }
  if (onSale) where.oldPrice = { not: null }
  if (selectedCategories.length > 0) {
    where.category = { slug: { in: selectedCategories } }
  }

  let allProducts = await prisma.product.findMany({
    where,
    include: { category: true },
  })

  const hasAny = (fieldValue: string, selected: string[]): boolean => {
    if (!fieldValue || selected.length === 0) return false
    const values = fieldValue.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    return selected.some(sel => values.includes(sel.toLowerCase()))
  }

  let filteredProducts = allProducts.filter(p => {
    for (let i = 1; i <= 15; i++) {
      const key = `filter${i}`
      if (filterValues[key].length > 0) {
        if (!hasAny((p as any)[key] || '', filterValues[key])) return false
      }
    }
    if (tagsVals.length > 0) {
      if (!hasAny(p.tags, tagsVals)) return false
    }
    if (scalesVals.length > 0) {
      if (!hasAny(p.scale, scalesVals)) return false
    }
    return true
  })

  // Вычисляем реальный ценовой диапазон среди отфильтрованных товаров
  let priceRangeMin = 0, priceRangeMax = 100;
  if (filteredProducts.length > 0) {
    let minFound = Infinity, maxFound = -Infinity;
    for (const p of filteredProducts) {
      if (p.price < minFound) minFound = p.price;
      if (p.price > maxFound) maxFound = p.price;
    }
    priceRangeMin = minFound;
    priceRangeMax = maxFound;
  }

  // Сортировка
  if (similarTo) {
    const baseProduct = await prisma.product.findUnique({ where: { article: similarTo }, include: { category: true } });
    if (baseProduct) {
      filteredProducts.sort((a, b) => similarityScore(b, baseProduct) - similarityScore(a, baseProduct));
    }
  } else if (sort !== 'default') {
    switch (sort) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  const total = filteredProducts.length
  const paginatedProducts = filteredProducts.slice(skip, skip + limit)

  const formattedProducts = paginatedProducts.map(p => ({
    ...p,
    images: p.images.split(','),
    tags: p.tags.split(',').map(t => t.trim()).filter(Boolean),
    image: p.images.split(',')[0] || '',
    categorySlug: p.category.slug,
    categoryName: p.category.name,
  }))

  return NextResponse.json({
    products: formattedProducts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    priceRange: { min: priceRangeMin, max: priceRangeMax }
  })
}