import { products } from '@/data/products';
import { ProductGrid } from '@/components/product/ProductGrid';

export default function CollectionsPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <h1
            className="text-2xl sm:text-3xl tracking-[0.3em] mb-2"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            ALL ITEMS
          </h1>
          <p className="text-sm text-[var(--color-nezumi)]">
            {products.length} items
          </p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
