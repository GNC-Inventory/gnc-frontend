'use client';

import { useState, useMemo, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductDetailModal from '../components/ProductDetailModal';
import CartSidebar from '../components/CartSidebar';
import CheckoutView from '../components/CheckoutView';
import CategorySection from '../components/CategorySection';
import EmptyState from '../components/EmptyState';
import PendingSaleCard from '../components/PendingSaleCard';
import { useInventory, type Product } from '../../hooks/useInventory';
import { useCart } from '../../hooks/useCart';
import { usePendingSales } from '../../hooks/usePendingSales';
import { createTransaction, saveTransaction } from '../../utils/transactionUtils';
import { showToast } from '../../utils/toast';

export default function ProductsPage() {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Custom hooks
  const { products, loading, error, refetch } = useInventory();
  const cart = useCart(products);
  const pendingSales = usePendingSales();

  // Derived state
  const showCart = useMemo(() => 
    cart.cartItems.length > 0 && !showCheckout, 
    [cart.cartItems.length, showCheckout]
  );

  const showPendingSales = useMemo(() => 
    pendingSales.pendingSales.length > 0 && cart.cartItems.length === 0 && !showCheckout,
    [pendingSales.pendingSales.length, cart.cartItems.length, showCheckout]
  );

  const isCompact = showCart || showCheckout;

  // Memoized filtered and grouped products
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      [p.name, p.sku, p.category].some(field => 
        field?.toLowerCase().includes(query)
      )
    );
  }, [products, searchQuery]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);

  // Memoized handlers
  const handleSelectProduct = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.stockLeft > 0) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  }, [products]);

  const handleAddToCart = useCallback((product: Product, price: number) => {
    const success = cart.addToCart(product, price);
    if (success) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  }, [cart]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleCompleteSale = useCallback(() => {
    setShowCheckout(true);
  }, []);

  const handleHoldSale = useCallback(() => {
    pendingSales.holdSale(cart.cartItems, cart.getTotalAmount());
    cart.clearCart();
  }, [pendingSales, cart]);

  const handleCancelSale = useCallback(() => {
    cart.clearCart();
  }, [cart]);

  const handleResumeSale = useCallback((saleId: string) => {
    const resumedItems = pendingSales.resumeSale(saleId);
    if (resumedItems) {
      // We need to restore the cart items
      // This would require modifying the useCart hook to have a setCartItems method
      // For now, we'll show a message
      showToast('Sale resumed - please re-add items to cart', 'info');
    }
  }, [pendingSales]);

  const handleBackToCart = useCallback(() => {
    setShowCheckout(false);
  }, []);

  const handlePrintReceipt = useCallback((customerName: string, paymentMethod: string) => {
    try {
      const transaction = createTransaction(cart.cartItems, customerName, paymentMethod);
      saveTransaction(transaction);
      
      console.log('Transaction created:', {
        id: transaction.id,
        customer: customerName,
        paymentMethod,
        total: transaction.total,
        items: cart.cartItems
      });

      showToast(`Transaction ${transaction.id} completed successfully!`, 'success');
      
      cart.clearCart();
      setShowCheckout(false);
      
    } catch (error) {
      console.error('Error processing transaction:', error);
      showToast('Error processing transaction. Please try again.', 'error');
    }
  }, [cart]);

  // Render loading state
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <EmptyState type="loading" />
      </div>
    );
  }

  return (
    <div 
      className={`
        p-8 transition-all duration-300
        ${showCart ? 'ml-4' : 'max-w-7xl mx-auto'}
      `}
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 mb-2">Failed to load products: {error}</p>
          <button 
            onClick={refetch} 
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Bar & Refresh */}
      {!showCheckout && (
        <div className="mb-6 flex items-center gap-4 w-full max-w-2xl">
          <div 
            className="bg-white rounded-lg flex items-center flex-1 max-w-[540px] h-9 px-2 gap-2"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search items by name or SKU or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm min-w-0"
            />
          </div>
          <button 
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex-shrink-0"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Pending Sales */}
      {showPendingSales && (
        <div className="mb-6 flex gap-6 overflow-x-auto pb-2">
          {pendingSales.pendingSales.map((sale, index) => (
            <PendingSaleCard
              key={sale.id}
              sale={sale}
              index={index}
              onResume={handleResumeSale}
            />
          ))}
        </div>
      )}

      {/* Products Container */}
      <div 
        className={`
          bg-white rounded-[32px] p-8 transition-all
          ${isCompact ? 'fixed overflow-y-auto' : 'relative'}
          ${isCompact ? 'w-[728px] h-[716px] top-[172px]' : 'w-full min-h-[728px]'}
          ${isCompact && typeof window !== 'undefined' && window.innerWidth > 1440 
            ? `left-[${(window.innerWidth - 1440) / 2 + 304}px]` 
            : isCompact ? 'left-[304px]' : ''
          }
        `}
        style={{
          backgroundColor: 'var(--bg-white-0, #FFFFFF)',
        }}
      >
        <div className="mb-4">
          <h2 className="font-medium text-sm text-black">
            Showing items by category ({products.length} products)
          </h2>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Products Content */}
        {Object.keys(groupedProducts).length === 0 ? (
          error ? (
            <EmptyState type="error" error={error} onRetry={refetch} />
          ) : searchQuery ? (
            <EmptyState type="no-search-results" searchQuery={searchQuery} />
          ) : (
            <EmptyState type="no-products" onRetry={refetch} />
          )
        ) : (
          Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <CategorySection
              key={category}
              category={category}
              products={categoryProducts}
              isCompact={isCompact}
              onSelectProduct={handleSelectProduct}
            />
          ))
        )}
      </div>

      {/* Modals & Sidebar */}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAddToCart={handleAddToCart} 
      />
      
      {showCart && (
        <CartSidebar
          cartItems={cart.cartItems}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onCompleteSale={handleCompleteSale}
          onHoldTransaction={handleHoldSale}
          onCancel={handleCancelSale}
        />
      )}

      {showCheckout && (
        <CheckoutView
          cartItems={cart.cartItems}
          onBack={handleBackToCart}
          onPrintReceipt={handlePrintReceipt}
        />
      )}
    </div>
  );
}