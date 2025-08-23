'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import ProductDetailModal from '../components/ProductDetailModal';
import CartSidebar from '../components/CartSidebar';
import CheckoutView from '../components/CheckoutView';
import { createTransaction, saveTransaction } from '../utils/transactionUtils';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  sku: string;
  basePrice: number;
  stockLeft: number;
  unitCost: number;
  dateAdded: string;
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

export default function ProductsPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utility functions
  const extractCategory = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('generator') || lower.includes('inverter') || lower.includes('solar') || lower.includes('tv')) return 'Electronics';
    if (lower.includes('washing') || lower.includes('refrigerator') || lower.includes('fan') || lower.includes('air conditioner')) return 'Appliances';
    if (lower.includes('theatre') || lower.includes('sound')) return 'Audio & Video';
    return 'General';
  };

  const loadData = (key: string) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  };

  const saveData = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // API call
  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://greatnabukoadmin.netlify.app/.netlify/functions/inventory');
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const result = await response.json();
      if (!result.success || !result.data) throw new Error('Invalid response format');
      
      const transformedProducts: Product[] = result.data.map((item: any) => ({
        id: item.id,
        name: item.product,
        image: item.image || '/products/default.png',
        category: extractCategory(item.product),
        sku: `SKU-${item.id.slice(-6).toUpperCase()}`,
        basePrice: item.unitCost,
        stockLeft: item.stockLeft,
        unitCost: item.unitCost,
        dateAdded: item.dateAdded,
        types: ['Standard'],
        brands: ['Generic'],
        sizes: ['Default']
      }));
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => { loadInventory(); }, []);

  useEffect(() => {
    const savedCart = loadData('cart');
    const savedPendingSales = loadData('pendingSales');
    const savedShowCart = localStorage.getItem('showCart') === 'true';
    
    setCartItems(savedCart);
    setPendingSales(savedPendingSales);
    if (savedShowCart && savedCart.length > 0) setShowCart(true);
  }, []);

  useEffect(() => {
    saveData('cart', cartItems);
    saveData('pendingSales', pendingSales);
    localStorage.setItem('showCart', showCart.toString());
  }, [cartItems, showCart, pendingSales]);

  // Computed values
  const filteredProducts = searchQuery.trim() 
    ? products.filter(p => [p.name, p.sku, p.category].some(field => 
        field?.toLowerCase().includes(searchQuery.toLowerCase())))
    : products;

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const showPendingSales = pendingSales.length > 0 && cartItems.length === 0 && !showCheckout;

  // Event handlers
  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.stockLeft > 0) {
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
    ['cart', 'showCart'].forEach(key => localStorage.removeItem(key));
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
    try {
      const transaction = createTransaction(cartItems, customerName, paymentMethod);
      saveTransaction(transaction);
      
      console.log('Transaction created successfully:', {
        id: transaction.id,
        customer: customerName,
        paymentMethod,
        total: transaction.total,
        items: cartItems
      });

      alert(`Transaction ${transaction.id} completed successfully!`);
      
      setCartItems([]);
      setShowCheckout(false);
      ['cart', 'showCart'].forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Error processing transaction. Please try again.');
    }
  };

  // Style helpers
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

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 transition-all duration-300 ${showCart ? 'ml-4' : 'max-w-7xl mx-auto'}`} style={getMainStyle()}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 mb-2">Failed to load products: {error}</p>
          <button onClick={loadInventory} className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Search Bar & Refresh */}
      {!showCheckout && (
        <div className="mb-6 flex items-center gap-4" style={{ width: '95%' }}>
          <div className="bg-white rounded-lg flex items-center" style={{ width: '540px', height: '36px', padding: '8px', gap: '8px' }}>
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name or SKU or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
          <button 
            onClick={loadInventory}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Pending Sales */}
      {showPendingSales && (
        <div className="mb-6 flex gap-6">
          {pendingSales.map((sale, index) => (
            <div key={sale.id} className="bg-white rounded-[32px] p-6 shadow-lg">
              <h3 className="text-gray-600 text-base font-medium mb-2">Pending sale {index + 1}</h3>
              <p className="text-gray-500 text-sm mb-4">
                {sale.items.reduce((total, item) => total + item.quantity, 0)} item{sale.items.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''}
              </p>
              <h2 className="text-3xl font-medium text-black mb-4">₦ {sale.total.toLocaleString()}</h2>
              <button onClick={() => handleResumeSale(sale.id)} className="w-full text-blue-600 font-medium hover:opacity-80 transition-opacity">
                Resume
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Products Container */}
      <div className={`bg-white rounded-[32px] p-8 ${(showCart || showCheckout) ? 'overflow-y-auto' : ''}`} style={getContainerStyle()}>
        <div className="mb-4">
          <h2 className="font-medium text-sm text-black">
            Showing items by category ({products.length} products)
          </h2>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Products grouped by category */}
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery ? 'No products found matching your search.' : 'No products available. Please check back later.'}
            </p>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category} className="mb-8">
              <h3 className="mb-4 font-semibold text-black">
                {category} ({categoryProducts.length})
              </h3>
              
              <div className={`grid gap-8 justify-items-center ${(showCart || showCheckout) ? 'grid-cols-4' : 'grid-cols-5'}`}>
                {categoryProducts.map((product) => {
                  const isOutOfStock = product.stockLeft === 0;
                  const isLowStock = product.stockLeft <= 5 && product.stockLeft > 0;
                  
                  return (
                    <div key={product.id} className={`border rounded-lg overflow-hidden transition-all ${isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-200'}`} style={getCardStyle(showCart || showCheckout)}>
                      <div className={`mb-3 flex items-center justify-center bg-gray-50 relative ${(showCart || showCheckout) ? 'h-32' : 'h-48'}`}>
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          width={(showCart || showCheckout) ? 120 : 160} 
                          height={(showCart || showCheckout) ? 120 : 160} 
                          className={`object-contain max-h-full ${isOutOfStock ? 'opacity-50' : ''}`} 
                        />
                        
                        {/* Stock indicator */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                            isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low (${product.stockLeft})` : `${product.stockLeft} left`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-2 mb-3">
                        <h3 className={`text-left font-medium text-sm ${isOutOfStock ? 'text-gray-500' : 'text-black'}`}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">₦{product.basePrice.toLocaleString()}</p>
                      </div>
                      
                      <div className="px-2">
                        <button 
                          onClick={() => handleSelectProduct(product.id)} 
                          disabled={isOutOfStock}
                          className={`border rounded-lg transition-colors flex items-center justify-center w-14 h-7 text-xs font-medium ${
                            isOutOfStock 
                              ? 'border-red-200 bg-red-50 cursor-not-allowed text-gray-400' 
                              : 'border-gray-200 hover:bg-gray-50 text-black'
                          }`}
                        >
                          {isOutOfStock ? 'N/A' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
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