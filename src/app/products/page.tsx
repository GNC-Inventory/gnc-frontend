'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import ProductDetailModal from '../components/ProductDetailModal';
import CartSidebar from '../components/CartSidebar';
import CheckoutView from '../components/CheckoutView';

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

interface PendingSale {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredProducts = searchQuery.trim() 
    ? mockProducts.filter(p => [p.name, p.sku, p.category].some(field => 
        field.toLowerCase().includes(searchQuery.toLowerCase())))
    : mockProducts;

  const showPendingSales = pendingSales.length > 0 && cartItems.length === 0 && !showCheckout;

  // Load from localStorage
  useEffect(() => {
    const loadData = (key: string) => {
      try { return JSON.parse(localStorage.getItem(key) || '[]'); } 
      catch { return []; }
    };

    const savedCart = loadData('cart');
    const savedPendingSales = loadData('pendingSales');
    const savedShowCart = localStorage.getItem('showCart') === 'true';
    
    setCartItems(savedCart);
    setPendingSales(savedPendingSales);
    if (savedShowCart && savedCart.length > 0) setShowCart(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('showCart', showCart.toString());
    localStorage.setItem('pendingSales', JSON.stringify(pendingSales));
  }, [cartItems, showCart, pendingSales]);

  const handleSelectProduct = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleAddToCart = (product: Product, price: number) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    const newItems = existingItem
      ? cartItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, price } : item)
      : [...cartItems, { id: product.id, name: product.name, image: product.image, price, quantity: 1 }];
    
    setCartItems(newItems);
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
    if (action === 'complete') {
      setShowCheckout(true);
      setShowCart(false);
      return;
    }
    
    if (action === 'hold') {
      const newPendingSale: PendingSale = {
        id: `pending-${Date.now()}`,
        items: [...cartItems],
        total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        createdAt: new Date()
      };
      setPendingSales(prev => [...prev, newPendingSale]);
    }
    
    setCartItems([]);
    setShowCart(false);
    localStorage.removeItem('cart');
    localStorage.removeItem('showCart');
  };

  const handleResumeSale = (saleId: string) => {
    const sale = pendingSales.find(s => s.id === saleId);
    if (sale) {
      setCartItems(sale.items);
      setShowCart(true);
      setPendingSales(prev => prev.filter(s => s.id !== saleId));
    }
  };

  const handlePrintReceipt = (customerName: string, paymentMethod: string) => {
    console.log('Printing receipt:', { customer: customerName, paymentMethod, items: cartItems });
    setCartItems([]);
    setShowCheckout(false);
    ['cart', 'showCart'].forEach(key => localStorage.removeItem(key));
  };

  const getContainerStyle = () => {
    const isCompact = showCart || showCheckout;
    const offset = typeof window !== 'undefined' && window.innerWidth > 1440 ? (window.innerWidth - 1440) / 2 : 0;
    
    return {
      width: isCompact ? '728px' : '95%',
      height: isCompact ? '716px' : 'auto',
      minHeight: isCompact ? 'auto' : '728px',
      position: isCompact ? 'fixed' : 'relative',
      top: isCompact ? '172px' : 'auto',
      left: isCompact ? `${offset + 304}px` : 'auto',
      borderRadius: '32px',
      backgroundColor: 'var(--bg-white-0, #FFFFFF)',
    } as const;
  };

  const getCardStyle = (isCompact: boolean) => ({
    width: isCompact ? '152px' : '192px',
    height: isCompact ? '246px' : '290px',
    borderRadius: '8px',
    gap: '12px',
    padding: '4px 4px 16px 4px',
    backgroundColor: 'var(--bg-white-0, #FFFFFF)',
    boxShadow: isCompact ? '0px 2px 4px 0px #1B1C1D0A' : 'none',
    border: isCompact ? 'none' : '1px solid #E5E7EB',
  });

  const getMainStyle = () => {
    const offset = typeof window !== 'undefined' && window.innerWidth > 1440 ? (window.innerWidth - 1440) / 2 : 0;
    return showCart ? { marginLeft: `${offset + 16}px` } : {};
  };

  return (
    <div className={`p-8 transition-all duration-300 ${showCart ? 'ml-4' : 'max-w-7xl mx-auto'}`} style={getMainStyle()}>
      {/* Search Bar */}
      {!showCheckout && (
        <div className="mb-6" style={{ width: '95%' }}>
          <div className="bg-white rounded-lg flex items-center" style={{ width: '540px', height: '36px', padding: '8px', gap: '8px' }}>
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name or SKU or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none bg-transparent"
              style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.6%', color: 'var(--text-sub-500, #525866)' }}
            />
          </div>
        </div>
      )}

      {/* Pending Sales */}
      {showPendingSales && (
        <div className="mb-6 flex gap-6">
          {pendingSales.map((sale, index) => (
            <div key={sale.id} className="bg-white rounded-[32px]" style={{ width: '258px', height: '204px', padding: '24px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px', lineHeight: '24px', letterSpacing: '-1.1%', color: '#525866', marginBottom: '8px' }}>
                Pending sale {index + 1}
              </h3>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.6%', color: '#868C98', marginBottom: '16px' }}>
                {sale.items.reduce((total, item) => total + item.quantity, 0)} item{sale.items.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''}
              </p>
              <h2 style={{ fontFamily: 'Geist, sans-serif', fontWeight: 500, fontSize: '32px', lineHeight: '40px', color: '#0A0D14', marginBottom: '16px' }}>
                ₦ {sale.total.toLocaleString()}
              </h2>
              <button onClick={() => handleResumeSale(sale.id)} className="w-full text-center hover:opacity-80 transition-opacity" 
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.6%', color: '#375DFB', background: 'none', border: 'none', cursor: 'pointer' }}>
                Resume
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Products Container */}
      <div className={`bg-white rounded-[32px] p-8 ${(showCart || showCheckout) ? 'overflow-y-auto' : ''}`} style={getContainerStyle()}>
        <div className="mb-4">
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.6%', color: '#0A0D14' }}>
            Showing items by name
          </h2>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>

        <div className={`grid gap-8 justify-items-center ${(showCart || showCheckout) ? 'grid-cols-4' : 'grid-cols-5'}`}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden" style={getCardStyle(showCart || showCheckout)}>
              <div className={`mb-3 flex items-center justify-center bg-gray-50 ${(showCart || showCheckout) ? 'h-32' : 'h-48'}`}>
                <Image src={product.image} alt={product.name} width={(showCart || showCheckout) ? 120 : 160} height={(showCart || showCheckout) ? 120 : 160} className="object-contain max-h-full" />
              </div>
              <div className="px-2 mb-3">
                <h3 className="text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#0A0D14' }}>
                  {product.name}
                </h3>
              </div>
              <div className="px-2">
                <button onClick={() => handleSelectProduct(product.id)} 
                        className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                        style={{ width: '57px', height: '28px', padding: '6px', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#0A0D14' }}>
                    Select
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: '#525866' }}>
              No products found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Modals & Sidebar */}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
        onAddToCart={handleAddToCart} 
      />
      
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

      {showCheckout && (
        <CheckoutView
          cartItems={cartItems}
          onBack={() => { setShowCheckout(false); setShowCart(true); }}
          onPrintReceipt={handlePrintReceipt}
        />
      )}
    </div>
  );
}