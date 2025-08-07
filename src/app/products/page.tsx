'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import ProductDetailModal from '../components/ProductDetailModal';
import CartSidebar from '../components/CartSidebar';

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

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Generator', image: '/products/generator.png', category: 'Electronics', sku: 'GEN001', basePrice: 150000, types: ['Portable', 'Gas-powered'], brands: ['Honda', 'Yamaha'], sizes: ['Small', 'Medium'] },
  { id: '2', name: 'Air Conditioner', image: '/products/air-conditioner.png', category: 'Electronics', sku: 'AC001', basePrice: 180000, types: ['Split', 'Window'], brands: ['LG', 'Samsung'], sizes: ['1HP', '1.5HP', '2HP'] },
  { id: '3', name: 'Television', image: '/products/television.png', category: 'Electronics', sku: 'TV001', basePrice: 120000, types: ['LED', 'Smart TV'], brands: ['Samsung', 'LG'], sizes: ['32"', '43"', '55"'] },
  { id: '4', name: 'Theatre System', image: '/products/theatre-system.png', category: 'Electronics', sku: 'TS001', basePrice: 95000, types: ['5.1', 'Bluetooth'], brands: ['Sony', 'JBL'], sizes: ['Compact', 'Full-size'] },
  { id: '5', name: 'Washing Machine', image: '/products/washing-machine.png', category: 'Appliances', sku: 'WM001', basePrice: 200000, types: ['Top-load', 'Front-load'], brands: ['Bosch', 'LG'], sizes: ['7kg', '8kg', '10kg'] },
  { id: '6', name: 'Drying Machine', image: '/products/drying-machine.png', category: 'Appliances', sku: 'DM001', basePrice: 180000, types: ['Condenser', 'Vented'], brands: ['Bosch', 'Samsung'], sizes: ['6kg', '8kg', '9kg'] },
  { id: '7', name: 'Solar Inverter', image: '/products/solar-inverter.png', category: 'Electronics', sku: 'SI001', basePrice: 85000, types: ['Pure Sine Wave', 'Modified'], brands: ['Luminous', 'Sukam'], sizes: ['1KVA', '2KVA', '5KVA'] },
  { id: '8', name: 'Fan', image: '/products/fan.png', category: 'Appliances', sku: 'FAN001', basePrice: 25000, types: ['Standing fan', 'Table-top'], brands: ['QASA', 'OX', 'Lontor', 'Oraimo', 'Soiltech'], sizes: ['13"', '14"', '15"', '16"', '17"', '18"', '19"', '20"', '21"', '22"', '23"'] },
  { id: '9', name: 'Refrigerator', image: '/products/refrigerator.png', category: 'Appliances', sku: 'REF001', basePrice: 220000, types: ['Single door', 'Double door'], brands: ['Samsung', 'LG'], sizes: ['200L', '350L', '500L'] },
  { id: '10', name: 'Solar Panel', image: '/products/solar-panel.png', category: 'Electronics', sku: 'SP001', basePrice: 45000, types: ['Monocrystalline', 'Polycrystalline'], brands: ['Jinko', 'Canadian Solar'], sizes: ['100W', '200W', '300W'] }
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = query.trim() 
      ? mockProducts.filter(p => [p.name, p.sku, p.category].some(field => 
          field.toLowerCase().includes(query.toLowerCase())))
      : mockProducts;
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleAddToCart = (product: Product, price: number) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1, price } : item));
    } else {
      setCartItems([...cartItems, { id: product.id, name: product.name, image: product.image, price, quantity: 1 }]);
    }
    setShowCart(true);
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return handleRemoveItem(id);
    setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (id: string) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    if (newItems.length === 0) setShowCart(false);
  };

  const handleCartAction = (action: 'complete' | 'hold' | 'cancel') => {
    console.log(`${action} action:`, cartItems);
    setCartItems([]);
    setShowCart(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6 mx-auto" style={{ width: '95%' }}>
        <div className="bg-white rounded-lg flex items-center" style={{ width: '540px', height: '36px', padding: '8px', gap: '8px' }}>
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name or SKU or category"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 outline-none bg-transparent"
            style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.6%', color: 'var(--text-sub-500, #525866)' }}
          />
        </div>
      </div>

      {/* Products Container */}
      <div className="bg-white rounded-[32px] p-8 mx-auto transition-all duration-300" 
           style={{ width: showCart ? 'calc(100% - 352px)' : '95%', minHeight: '728px' }}>
        
        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.6%', color: 'var(--text-main-900, #0A0D14)' }}>
            Showing items by name
          </h2>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Products Grid */}
        <div className="grid grid-cols-5 gap-8 justify-items-center">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden" 
                 style={{ width: '192px', height: '290px', padding: '4px 4px 16px 4px' }}>
              
              {/* Product Image */}
              <div className="h-48 mb-3 flex items-center justify-center bg-gray-50">
                <Image src={product.image} alt={product.name} width={160} height={160} className="object-contain max-h-full" />
              </div>

              {/* Product Name */}
              <div className="px-2 mb-3">
                <h3 className="text-left" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: 'var(--text-main-900, #0A0D14)' }}>
                  {product.name}
                </h3>
              </div>

              {/* Select Button */}
              <div className="px-2">
                <button onClick={() => handleSelectProduct(product.id)} 
                        className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                        style={{ width: '57px', height: '28px', padding: '6px', backgroundColor: 'var(--bg-white-0, #FFFFFF)' }}>
                  <span style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: 'var(--text-main-900, #0A0D14)' }}>
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
            <p style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: 'var(--text-sub-500, #525866)' }}>
              No products found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Modals & Sidebar */}
      <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} onAddToCart={handleAddToCart} />
      
      {showCart && (
        <CartSidebar
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCompleteSale={() => handleCartAction('complete')}
          onHoldTransaction={() => handleCartAction('hold')}
          onCancel={() => handleCartAction('cancel')}
        />
      )}
    </div>
  );
}