import { notFound } from 'next/navigation';
import { categories } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import { ProductGrid } from '@/components/product/ProductGrid';

export function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return notFound();

  const categoryProducts = getProductsByCategory(category);

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] text-[var(--color-kin)] mb-2">
            {cat.nameEn}
          </p>
          <h1
            className="text-2xl sm:text-3xl tracking-[0.3em] mb-2"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            {cat.name}
          </h1>
          <p className="text-sm text-[var(--color-nezumi)]">{cat.description}</p>
        </div>
        <ProductGrid products={categoryProducts} />
      </div>
    </div>
  );
}
