// src/components/ProductCard.tsx

'use client';

import Image from 'next/image';
import { type Product } from '../../hooks/useInventory';

interface ProductCardProps {
  product: Product;
  isCompact: boolean;
  onSelect: (productId: string) => void;
}

export default function ProductCard({ product, isCompact, onSelect }: ProductCardProps) {
  const isOutOfStock = product.stockLeft === 0;
  const isLowStock = product.stockLeft <= 5 && product.stockLeft > 0;

  const handleSelect = () => {
    if (!isOutOfStock) {
      onSelect(product.id);
    }
  };

  return (
    <div 
      className={`
        border rounded-lg overflow-hidden transition-all
        ${isCompact ? 'w-[152px] h-[246px]' : 'w-[192px] h-[290px]'}
        ${isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:shadow-md'}
        ${isCompact ? 'shadow-sm' : ''}
      `}
      style={{
        padding: '4px 4px 16px 4px',
        gap: '12px',
        backgroundColor: 'var(--bg-white-0, #FFFFFF)',
      }}
    >
      {/* Product Image Container */}
      <div 
        className={`
          flex items-center justify-center bg-gray-50 relative mb-3
          ${isCompact ? 'h-32' : 'h-48'}
        `}
      >
        <Image 
          src={product.image} 
          alt={product.name} 
          width={isCompact ? 120 : 160} 
          height={isCompact ? 120 : 160} 
          className={`
            object-contain max-h-full
            ${isOutOfStock ? 'opacity-50' : ''}
          `} 
        />
        
        {/* Stock Indicator */}
        <div className="absolute top-2 right-2">
          <span 
            className={`
              px-2 py-1 rounded text-xs font-medium text-white
              ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-orange-500' : 'bg-green-500'}
            `}
          >
            {isOutOfStock 
              ? 'Out of Stock' 
              : isLowStock 
                ? `Low (${product.stockLeft})` 
                : `${product.stockLeft} left`
            }
          </span>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="px-2 mb-3">
        <h3 
          className={`
            text-left font-medium text-sm truncate
            ${isOutOfStock ? 'text-gray-500' : 'text-black'}
          `}
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          ₦{product.basePrice.toLocaleString()}
        </p>
      </div>
      
      {/* Select Button */}
      <div className="px-2">
        <button 
          onClick={handleSelect}
          disabled={isOutOfStock}
          className={`
            border rounded-lg transition-colors flex items-center justify-center 
            w-14 h-7 text-xs font-medium
            ${isOutOfStock 
              ? 'border-red-200 bg-red-50 cursor-not-allowed text-gray-400' 
              : 'border-gray-200 hover:bg-gray-50 text-black hover:border-blue-300'
            }
          `}
        >
          {isOutOfStock ? 'N/A' : 'Select'}
        </button>
      </div>
    </div>
  );
}