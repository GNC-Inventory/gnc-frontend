// src/components/CategorySection.tsx

'use client';

import { type Product } from '../../hooks/useInventory';
import ProductCard from './ProductCard';

interface CategorySectionProps {
  category: string;
  products: Product[];
  isCompact: boolean;
  onSelectProduct: (productId: string) => void;
}

export default function CategorySection({ 
  category, 
  products, 
  isCompact, 
  onSelectProduct 
}: CategorySectionProps) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-semibold text-black">
        {category} ({products.length})
      </h3>
      
      <div 
        className={`
          grid gap-8 justify-items-center
          ${isCompact ? 'grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}
        `}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isCompact={isCompact}
            onSelect={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
}