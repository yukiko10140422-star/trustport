'use client';

import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  products,
  columns = 4,
}: {
  readonly products: readonly Product[];
  readonly columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns];

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p
          className="text-[var(--color-nezumi)] text-lg"
          style={{ fontFamily: 'var(--font-serif-jp)' }}
        >
          商品がありません
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
