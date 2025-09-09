'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { showToast } from '../../utils/toast';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CustomerDetails {
  name: string;
  address: string;
  phone: string;
}

interface CompletedTransaction {
  id: string;
  items: CartItem[];
  customer: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  status: 'Successful';
}

export default function ProductsPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<CompletedTransaction | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  // Hooks
  const { products, loading, error, refetch } = useInventory();
  
  // Update local products when products change
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const cart = useCart(localProducts);
  const pendingSales = usePendingSales();

  // Computed - use localProducts instead of products for real-time updates
  const showCart = useMemo(() => cart.cartItems.length > 0 && !showCheckout, [cart.cartItems.length, showCheckout]);
  const showPendingSales = useMemo(() => pendingSales.pendingSales.length > 0 && cart.cartItems.length === 0 && !showCheckout, [pendingSales.pendingSales.length, cart.cartItems.length, showCheckout]);
  const isCompact = showCart || showCheckout;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return localProducts;
    const query = searchQuery.toLowerCase();
    return localProducts.filter(p => [p.name, p.sku, p.category].some(field => field?.toLowerCase().includes(query)));
  }, [localProducts, searchQuery]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);

  // API call
  const processSaleAPI = async (items: CartItem[], customer: string, paymentMethod: string) => {
     console.log('Items being sent to API:', items);
  const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/sales', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
    },
    body: JSON.stringify({ 
      items,
      customer: {
        name: customer,
        address: '',
        phone: ''
      },
      paymentMethod 
    })
  });

  const result = await response.json();
  console.log('API Response:', result); // Add logging to debug
  
  if (!result.success) {
    const errorMessage = typeof result.error === 'object' 
      ? result.error.message || result.error.code || 'Failed to process sale'
      : result.error || 'Failed to process sale';
    throw new Error(errorMessage);
  }
  
  return result.data; // Add this return statement
};

  // New handler for inventory updates from ProductDetailModal
  const handleInventoryUpdate = useCallback((productId: string, newStockLeft: number) => {
    setLocalProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, stockLeft: newStockLeft }
          : product
      )
    );
  }, []);

  // Handlers
  const handleSelectProduct = useCallback((productId: string) => {
    const product = localProducts.find(p => p.id === productId);
    if (product && product.stockLeft > 0) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    } else if (product && product.stockLeft === 0) {
      showToast('Product is out of stock', 'error');
    }
  }, [localProducts]);

  const handleAddToCart = useCallback((product: Product, price: number, quantity: number) => {
    const success = cart.addToCart(product, price, quantity);
    if (success) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  }, [cart]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleCompleteSale = useCallback(async () => {
    if (cart.cartItems.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    setIsProcessingSale(true);
    
    try {
      const transaction = await processSaleAPI(cart.cartItems, 'Customer', 'Cash');
      setCompletedTransaction(transaction);
      showToast('Sale processed successfully! Inventory updated.', 'success');
      refetch();
      setShowCheckout(true);
    } catch (error: unknown) {
      console.error('Error processing sale:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Insufficient stock')) {
        showToast('Insufficient stock for some items. Please check inventory.', 'error');
      } else if (errorMessage.includes('not found')) {
        showToast('Some products are no longer available. Please refresh and try again.', 'error');
        refetch();
      } else {
        showToast('Failed to process sale. Please try again.', 'error');
      }
    } finally {
      setIsProcessingSale(false);
    }
  }, [cart, refetch]);

  const handleHoldSale = useCallback(() => {
    pendingSales.holdSale(cart.cartItems, cart.getTotalAmount());
    cart.clearCart();
  }, [pendingSales, cart]);

  const handleCancelSale = useCallback(() => cart.clearCart(), [cart]);

  const handleResumeSale = useCallback((saleId: string) => {
    const resumedItems = pendingSales.resumeSale(saleId);
    if (resumedItems) showToast('Sale resumed - please re-add items to cart', 'info');
  }, [pendingSales]);

  const handleBackToCart = useCallback(() => {
    if (completedTransaction) {
      cart.clearCart();
      setCompletedTransaction(null);
      setShowCheckout(false);
    } else {
      setShowCheckout(false);
    }
  }, [completedTransaction, cart]);

  const handlePrintReceipt = useCallback((customerDetails: CustomerDetails, paymentMethod: string) => {
    try {
      if (!completedTransaction) {
        showToast('No completed transaction to print', 'error');
        return;
      }

      const finalTransaction = { 
        ...completedTransaction, 
        customer: customerDetails.name,
        customerAddress: customerDetails.address,
        customerPhone: customerDetails.phone,
        paymentMethod 
      };

      console.log('Receipt printed for transaction:', finalTransaction);
      showToast(`Receipt printed for ${customerDetails.name}!`, 'success');
      
      cart.clearCart();
      setCompletedTransaction(null);
      setShowCheckout(false);
    } catch (error) {
      console.error('Error printing receipt:', error);
      showToast('Error printing receipt. Please try again.', 'error');
    }
  }, [cart, completedTransaction]);

  if (loading) {
    return (
      <div style={{ 
        padding: '32px', 
        maxWidth: '1280px', 
        margin: '0 auto' 
      }}>
        <EmptyState type="loading" />
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      transition: 'all 0.3s',
      marginLeft: showCart ? '16px' : '0',
      maxWidth: showCart ? 'none' : '1280px',
      margin: showCart ? '0 0 0 16px' : '0 auto'
    }}>
      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px'
        }}>
          <p style={{ 
            color: '#B91C1C', 
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            Failed to load products: {error}
          </p>
          <button 
            onClick={refetch} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FECACA'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Bar & Refresh */}
      {!showCheckout && (
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: '672px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            maxWidth: '540px',
            height: '36px',
            padding: '0 8px',
            gap: '8px'
          }}>
            <MagnifyingGlassIcon style={{
              width: '20px',
              height: '20px',
              color: '#9CA3AF',
              flexShrink: 0
            }} />
            <input
              type="text"
              placeholder="Search items by name or SKU or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                minWidth: 0,
                border: 'none'
              }}
            />
          </div>
          <button 
            onClick={refetch}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#93C5FD' : '#2563EB',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              fontSize: '14px',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Pending Sales */}
      {showPendingSales && (
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {pendingSales.pendingSales.map((sale, index) => (
            <PendingSaleCard key={sale.id} sale={sale} index={index} onResume={handleResumeSale} />
          ))}
        </div>
      )}

      {/* Products Container */}
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '32px',
          padding: '32px',
          transition: 'all 0.3s',
          position: isCompact ? 'fixed' : 'relative',
          overflow: isCompact ? 'auto' : 'visible',
          width: isCompact ? '728px' : '100%',
          height: isCompact ? '716px' : 'auto',
          minHeight: isCompact ? 'auto' : '728px',
          top: isCompact ? '172px' : 'auto',
          left: isCompact ? (typeof window !== 'undefined' && window.innerWidth > 1440 
            ? `${(window.innerWidth - 1440) / 2 + 304}px` 
            : '304px') : 'auto'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{
            fontWeight: 500,
            fontSize: '14px',
            color: 'black',
            margin: 0
          }}>
            Showing items by category ({localProducts.length} products)
          </h2>
        </div>
        <div style={{
          borderTop: '1px solid #E5E7EB',
          marginBottom: '24px'
        }}></div>

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
          <div style={{
            display: 'grid',
            gap: '32px',
            gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))'
          }}>
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <CategorySection
                key={category}
                category={category}
                products={categoryProducts}
                isCompact={isCompact}
                onSelectProduct={handleSelectProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals & Sidebar */}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAddToCart={handleAddToCart}
        onInventoryUpdate={handleInventoryUpdate}
      />
      
      {showCart && (
        <CartSidebar
          cartItems={cart.cartItems}
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

      {/* Processing Sale Loading Overlay */}
      {isProcessingSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #E5E7EB',
              borderTop: '2px solid #2563EB',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#374151' }}>Processing sale...</span>
          </div>
        </div>
      )}

      {/* Add keyframes for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}