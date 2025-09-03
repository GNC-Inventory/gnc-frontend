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
import { showToast } from '../../utils/toast';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
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
  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<CompletedTransaction | null>(null);

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

  // API call to process sale and deduct inventory
  const processSaleAPI = async (items: CartItem[], customer: string, paymentMethod: string) => {
    try {
      const response = await fetch('https://greatnabukoadmin.netlify.app/.netlify/functions/inventory/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          customer: customer,
          paymentMethod: paymentMethod
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to process sale');
      }

      return result.transaction;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

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

  // Updated: Process sale and deduct inventory when "Complete Sale" is clicked
  const handleCompleteSale = useCallback(async () => {
    if (cart.cartItems.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    setIsProcessingSale(true);
    
    try {
      // For now, use default customer and payment method for the API call
      // We'll collect the real customer info in the checkout view
      const defaultCustomer = 'Customer'; // Temporary
      const defaultPaymentMethod = 'Cash'; // Temporary
      
      // Process sale and deduct inventory
      const transaction = await processSaleAPI(cart.cartItems, defaultCustomer, defaultPaymentMethod);
      
      // Store the completed transaction for the checkout view
      setCompletedTransaction(transaction);
      
      // Show success message
      showToast('Sale processed successfully! Inventory updated.', 'success');
      
      // Refresh inventory to show updated stock levels
      refetch();
      
      // Show checkout view for customer details and receipt printing
      setShowCheckout(true);
      
    } catch (error: any) {
      console.error('Error processing sale:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Insufficient stock')) {
        showToast('Insufficient stock for some items. Please check inventory.', 'error');
      } else if (error.message?.includes('not found')) {
        showToast('Some products are no longer available. Please refresh and try again.', 'error');
        refetch(); // Refresh to get latest inventory
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

  const handleCancelSale = useCallback(() => {
    cart.clearCart();
  }, [cart]);

  const handleResumeSale = useCallback((saleId: string) => {
    const resumedItems = pendingSales.resumeSale(saleId);
    if (resumedItems) {
      showToast('Sale resumed - please re-add items to cart', 'info');
    }
  }, [pendingSales]);

  const handleBackToCart = useCallback(() => {
    // If we have a completed transaction, clear cart and go back to products
    if (completedTransaction) {
      cart.clearCart();
      setCompletedTransaction(null);
      setShowCheckout(false);
    } else {
      // If sale wasn't processed yet, just go back to cart
      setShowCheckout(false);
    }
  }, [completedTransaction, cart]);

  // Updated: Just handle receipt printing (no inventory changes)
  const handlePrintReceipt = useCallback((customerName: string, paymentMethod: string) => {
    try {
      if (!completedTransaction) {
        showToast('No completed transaction to print', 'error');
        return;
      }

      // Update transaction with final customer details
      const finalTransaction = {
        ...completedTransaction,
        customer: customerName,
        paymentMethod: paymentMethod
      };

      // Save to local storage for transaction history
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      existingTransactions.push(finalTransaction);
      localStorage.setItem('transactions', JSON.stringify(existingTransactions));

      console.log('Receipt printed for transaction:', finalTransaction);
      
      showToast(`Receipt printed for ${customerName}!`, 'success');
      
      // Clear everything and return to products
      cart.clearCart();
      setCompletedTransaction(null);
      setShowCheckout(false);
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      showToast('Error printing receipt. Please try again.', 'error');
    }
  }, [cart, completedTransaction]);

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
          <div className={`grid gap-8 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
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

      {/* Processing Sale Loading Overlay */}
      {isProcessingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing sale...</span>
          </div>
        </div>
      )}
    </div>
  );
}