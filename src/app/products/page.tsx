'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Mock products data structure
interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  sku: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Generator',
    image: '/products/generator.png',
    category: 'Electronics',
    sku: 'GEN001'
  },
  {
    id: '2',
    name: 'Air Conditioner',
    image: '/products/air-conditioner.png',
    category: 'Electronics',
    sku: 'AC001'
  },
  {
    id: '3',
    name: 'Television',
    image: '/products/television.png',
    category: 'Electronics',
    sku: 'TV001'
  },
  {
    id: '4',
    name: 'Theatre System',
    image: '/products/theatre-system.png',
    category: 'Electronics',
    sku: 'TS001'
  },
  {
    id: '5',
    name: 'Washing Machine',
    image: '/products/washing-machine.png',
    category: 'Appliances',
    sku: 'WM001'
  },
  {
    id: '6',
    name: 'Drying Machine',
    image: '/products/drying-machine.png',
    category: 'Appliances',
    sku: 'DM001'
  },
  {
    id: '7',
    name: 'Solar Inverter',
    image: '/products/solar-inverter.png',
    category: 'Electronics',
    sku: 'SI001'
  },
  {
    id: '8',
    name: 'Fan',
    image: '/products/fan.png',
    category: 'Appliances',
    sku: 'FAN001'
  },
  {
    id: '9',
    name: 'Refrigerator',
    image: '/products/refrigerator.png',
    category: 'Appliances',
    sku: 'REF001'
  },
  {
    id: '10',
    name: 'Solar Panel',
    image: '/products/solar-panel.png',
    category: 'Electronics',
    sku: 'SP001'
  }
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProducts(mockProducts);
      return;
    }

    const filtered = mockProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.sku.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (productId: string) => {
    console.log('Selected product:', productId);
    // Handle product selection logic here
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6 mx-auto" style={{ width: '95%' }}>
        <div 
          className="bg-white rounded-lg flex items-center"
          style={{
            width: '540px',
            height: '36px',
            borderRadius: '8px',
            gap: '8px',
            padding: '8px',
          }}
        >
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name or SKU or category"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent"
            style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-sub-500, #525866)',
            }}
          />
        </div>
      </div>

      {/* Products Container */}
      <div 
        className="bg-white rounded-[32px] p-8 mx-auto"
        style={{
          width: '95%',
          minHeight: '728px',
        }}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            Showing items by name
          </h2>
        </div>

        {/* Divider Line */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Products Grid */}
        <div className="grid grid-cols-5 gap-8 justify-items-center">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
              style={{
                width: '192px',
                height: '290px',
                borderRadius: '8px',
                paddingTop: '4px',
                paddingRight: '4px',
                paddingBottom: '16px',
                paddingLeft: '4px',
                gap: '12px',
              }}
            >
              {/* Product Image */}
              <div className="h-48 mb-3 flex items-center justify-center bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={160}
                  height={160}
                  className="object-contain max-h-full"
                />
              </div>

              {/* Product Name */}
              <div className="px-2 mb-3">
                <h3 
                  className="text-center"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  {product.name}
                </h3>
              </div>

              {/* Select Button */}
              <div className="px-2">
                <button
                  onClick={() => handleSelectProduct(product.id)}
                  className="w-full border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{
                    height: '28px',
                    borderRadius: '8px',
                    gap: '2px',
                    padding: '6px',
                    backgroundColor: 'var(--bg-white-0, #FFFFFF)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: 'var(--text-main-900, #0A0D14)',
                    }}
                  >
                    Select
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p 
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--text-sub-500, #525866)',
              }}
            >
              No products found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}