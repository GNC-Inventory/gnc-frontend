'use client';

import { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  sku: string;
  basePrice?: number;
  types?: string[];
  brands?: string[];
  sizes?: string[];
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose 
}: ProductDetailModalProps) {
  const [price, setPrice] = useState('');

  const handleAddItem = () => {
    if (product && price) {
      console.log('Adding item:', {
        product: product.name,
        price: parseFloat(price),
      });
      // Handle add to cart logic here
      onClose();
    }
  };

  const isAddButtonActive = price.trim() !== '';

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div 
        className="fixed bg-white z-50"
        style={{
          width: '1104px',
          height: '760px',
          top: '140px',
          left: '50%',
          transform: 'translateX(-50%)',
          paddingTop: '24px',
          paddingRight: '32px',
          paddingBottom: '24px',
          paddingLeft: '32px',
          gap: '24px',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
        }}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-start mb-6">
          {/* Product Name */}
          <div>
            <h2 
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '32px',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              {product.name}
            </h2>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Left Side - Product Image and Details */}
          <div className="flex-1">
            {/* Product Image */}
            <div className="mb-8 bg-gray-50 rounded-lg p-8 flex items-center justify-center" style={{ height: '300px' }}>
              <Image
                src={product.image}
                alt={product.name}
                width={250}
                height={250}
                className="object-contain max-h-full"
              />
            </div>

            {/* Product Specifications */}
            <div className="space-y-6">
              {/* Type */}
              <div>
                <h3 
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.types && product.types.length > 0 ? (
                    product.types.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: 'var(--text-sub-500, #525866)',
                        }}
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No types available</span>
                  )}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  Brand
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.brands && product.brands.length > 0 ? (
                    product.brands.map((brand, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: 'var(--text-sub-500, #525866)',
                        }}
                      >
                        {brand}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No brands available</span>
                  )}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: 'var(--text-sub-500, #525866)',
                        }}
                      >
                        {size}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No sizes available</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Price Input and Add Button */}
          <div className="w-80">
            {/* Enter Price Section */}
            <div className="mb-6">
              <label 
                htmlFor="price"
                className="block mb-3"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: 'var(--text-main-900, #0A0D14)',
                }}
              >
                Enter price
              </label>
              
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={product.basePrice ? `₦${product.basePrice.toLocaleString()}` : 'Enter price'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                }}
              />
            </div>

            {/* Add Item Button */}
            <button
              onClick={handleAddItem}
              disabled={!isAddButtonActive}
              className={`flex items-center justify-center rounded-lg transition-all ${
                isAddButtonActive
                  ? 'hover:opacity-90 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                width: '160px',
                height: '40px',
                borderRadius: '10px',
                gap: '4px',
                padding: '10px',
                backgroundColor: isAddButtonActive 
                  ? 'var(--primary-base, #375DFB)' 
                  : '#E5E7EB',
              }}
            >
              <ShoppingCartIcon 
                className="w-4 h-4" 
                style={{ 
                  color: isAddButtonActive ? '#FFFFFF' : '#9CA3AF' 
                }} 
              />
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: isAddButtonActive ? '#FFFFFF' : '#9CA3AF',
                }}
              >
                Add item
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}