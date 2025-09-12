'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductDetailModal from '../components/ProductDetailModal';
import CartSidebar from '../components/CartSidebar';
import CheckoutView from '../components/CheckoutView';
import EmptyState from '../components/EmptyState';
import PendingSaleCard from '../components/PendingSaleCard';
import { useInventory, type Product } from '../../hooks/useInventory';
import { useCart } from '../../hooks/useCart';
import { usePendingSales } from '../../hooks/usePendingSales';
import { showToast } from '../../utils/toast';
import ReceiptModal from '../components/ReceiptModal';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  toggleProductSelection, 
  selectAllProducts,  
  setSelectionMode,
  type SelectedProduct 
} from '../../store/selectionSlice';
import BulkCartModal from '../components/BulkCartModal';
import Image from 'next/image';

interface CartItem {
  id: string;
  name: string;
  make?: string;        // Add this
  model?: string;       // Add this
  type?: string;        // Add this
  capacity?: string;    // Add this
  description?: string; // Add this
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
   paymentBreakdown?: {
    pos: number;
    transfer: number;
    cashInHand: number;
    salesOnReturn: number;
  };
  total: number;
  createdAt: string;
  status: 'Successful';
}

interface ProductItem {
  id: string;
  name: string;
  image: string;
  category: string;
  basePrice: number;
  stockLeft: number;
  make?: string;
  model?: string;
  sku: string;          // Add this
  dateAdded: string;    // Add this
}

interface PaymentBreakdown {
  pos: number;
  transfer: number;
  cashInHand: number;
  salesOnReturn: number;
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
  const dispatch = useAppDispatch();
  const { selectedProducts, isSelectionMode } = useAppSelector(state => state.selection);
  const [showBulkCartModal, setShowBulkCartModal] = useState(false);

  // Hooks
  const { products, loading, error, refetch } = useInventory();
  const router = useRouter();
  
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
  const processSaleAPI = async (items: CartItem[], customer: string, paymentBreakdown: PaymentBreakdown) => {
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
  paymentBreakdown,
  paymentMethod: 'Mixed' // Temporary fallback for backend compatibility
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

  // Add the missing handleResumeSale function
  const handleResumeSale = useCallback((saleId: string) => {
    const resumedItems = pendingSales.resumeSale(saleId);
    if (resumedItems) {
      showToast('Sale resumed - please re-add items to cart', 'info');
    }
  }, [pendingSales]);

const handleToggleSelection = useCallback((product: Product) => {
  const selectedProduct: SelectedProduct = {
    id: product.id,
    name: product.name,
    image: product.image,
    category: product.category,
    basePrice: product.basePrice,
    stockLeft: product.stockLeft,
    make: product.make,
    model: product.model
  };
  dispatch(toggleProductSelection(selectedProduct));
}, [dispatch]);

const handleSelectAll = useCallback(() => {
  const allProducts: SelectedProduct[] = filteredProducts.map(product => ({
    id: product.id,
    name: product.name,
    image: product.image,
    category: product.category,
    basePrice: product.basePrice,
    stockLeft: product.stockLeft,
    make: product.make,
    model: product.model
  }));
  dispatch(selectAllProducts(allProducts));
}, [dispatch, filteredProducts]);


const handleSetSelectionMode = useCallback((mode: boolean) => {
  dispatch(setSelectionMode(mode));
}, [dispatch]);

const addSelectedToCart = useCallback(() => {
  setShowBulkCartModal(true);
}, []);

const handleBulkAddToCart = useCallback(async (items: Array<{
  product: {
    id: string;
    name: string;
    image: string;
    category: string;
    basePrice: number;
    stockLeft: number;
    make?: string;
    model?: string;
  };
  price: number;
  quantity: number;
}>) => {
  for (const item of items) {
    // Find the full product from your products array
const fullProduct = localProducts.find(p => p.id === item.product.id);
if (!fullProduct) {
  showToast(`Product ${item.product.name} not found`, 'error');
  return;
}
const success = cart.addToCart(fullProduct, item.price, item.quantity);
    if (!success) {
      showToast(`Failed to add ${item.product.name} to cart`, 'error');
      return;
    }
  }
  showToast(`Successfully added ${items.length} products to cart!`, 'success');
}, [cart]);

const handleCompleteSale = useCallback(async () => {
  console.log('Cart items being sent:', JSON.stringify(cart.cartItems, null, 2));
  if (cart.cartItems.length === 0) {
    showToast('Cart is empty', 'error');
    return;
  }

  setIsProcessingSale(true);
  
  try {
    const transaction = await processSaleAPI(cart.cartItems, 'Customer', {
  pos: cart.getTotalAmount(), // Use actual cart total for now
  transfer: 0,
  cashInHand: 0,
  salesOnReturn: 0
});
    
    // CRITICAL: Store cart items BEFORE clearing the cart
    const enhancedTransaction = {
      ...transaction,
      items: cart.cartItems.map(item => ({
        id: item.id,
        name: item.name,
        make: item.make,
        model: item.model,
        type: item.type,
        capacity: item.capacity,
        description: item.description,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      }))
    };
    
    setCompletedTransaction(enhancedTransaction);
    showToast('Sale processed successfully! Inventory updated.', 'success');
    // REMOVED: refetch() - this was causing stale data to overwrite correct local state
    
    await cart.clearCart(false);
    setShowCheckout(true);
  } catch (error: unknown) {
    console.error('Error processing sale:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('Insufficient stock')) {
      showToast('Insufficient stock for some items. Please check inventory.', 'error');
    } else if (errorMessage.includes('not found')) {
      showToast('Some products are no longer available. Please refresh and try again.', 'error');
      refetch(); // Keep this refetch only in error cases
    } else {
      showToast('Failed to process sale. Please try again.', 'error');
    }
  } finally {
    setIsProcessingSale(false);
  }
}, [cart, refetch]);

const handleHoldSale = useCallback(async () => {
  pendingSales.holdSale(cart.cartItems, cart.getTotalAmount());
  await cart.clearCart(true); // Restore inventory when holding sale
}, [pendingSales, cart]);

const handleCancelSale = useCallback(async () => {
  await cart.clearCart(true); // Restore inventory when canceling
}, [cart]);

const handleBackToCart = useCallback(async () => {
  if (completedTransaction) {
    await cart.clearCart(false); // Don't restore - transaction completed
    setCompletedTransaction(null);
    setShowCheckout(false);
  } else {
    setShowCheckout(false);
  }
}, [completedTransaction, cart]);

const handlePrintReceipt = useCallback(async (customerDetails: CustomerDetails, paymentBreakdown: PaymentBreakdown) => {
  try {
    if (!completedTransaction) {
      showToast('No completed transaction to print', 'error');
      return;
    }

    // Items are already preserved from handleCompleteSale
    const finalTransaction = { 
  ...completedTransaction, 
  customer: customerDetails.name,
  customerAddress: customerDetails.address,
  customerPhone: customerDetails.phone,
  paymentBreakdown
};

    setCompletedTransaction(finalTransaction);
    setShowCheckout(false);
    showToast(`Receipt printed for ${customerDetails.name}!`, 'success');
  } catch (error) {
    console.error('Error printing receipt:', error);
    showToast('Error printing receipt. Please try again.', 'error');
  }
}, [completedTransaction]);

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
    overflow: isCompact ? 'auto' : 'auto', // Change this from 'visible' to 'auto'
    width: isCompact ? '728px' : '100%',
    height: isCompact ? '716px' : '600px', // Add fixed height
    top: isCompact ? '172px' : 'auto',
    left: isCompact ? (typeof window !== 'undefined' && window.innerWidth > 1440 
      ? `${(window.innerWidth - 1440) / 2 + 304}px` 
      : '304px') : 'auto'
  }}
>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h2 style={{
    fontWeight: 500,
    fontSize: '14px',
    color: 'black',
    margin: 0
  }}>
    Showing items by category ({localProducts.length} products)
    {Object.keys(selectedProducts).length > 0 && (
  <span style={{ color: '#2563EB', marginLeft: '8px' }}>
    • {Object.keys(selectedProducts).length} selected
  </span>
)}
  </h2>
  
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
        onClick={() => handleSetSelectionMode(!isSelectionMode)}
        style={{
        padding: '6px 12px',
        fontSize: '12px',
        backgroundColor: isSelectionMode ? '#EF4444' : '#2563EB',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      {isSelectionMode ? 'Cancel Selection' : 'Select Multiple'}
    </button>
    
    {isSelectionMode && (
      <>
        <button
            onClick={handleSelectAll}
            style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Select All
        </button>
        
        {Object.keys(selectedProducts).length > 0 && (
  <button
    onClick={addSelectedToCart}
    style={{
      padding: '6px 12px',
      fontSize: '12px',
      backgroundColor: '#F59E0B',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }}
  >
    Add Selected ({Object.keys(selectedProducts).length})
  </button>
)}
      </>
    )}
  </div>
</div>
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} style={{ marginBottom: '24px' }}>
        {/* Category Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#000', 
            margin: 0 
          }}>
            {category} ({categoryProducts.length})
          </h3>
          <button 
  onClick={() => router.push(`/products/category/${encodeURIComponent(category.toLowerCase())}`)}
  style={{
    color: '#2563EB',
    fontSize: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  }}
>
  See All →
</button>
        </div>
        
        {/* Horizontal Scrolling Products */}
        <div style={{
  display: 'flex',
  gap: '16px',
  overflowX: 'auto',
  paddingBottom: '8px',
  scrollbarWidth: 'thin',
  scrollbarColor: '#CBD5E1 #F1F5F9'
}}>
          {categoryProducts.map((product) => (
            <div
              key={product.id}
              onClick={(e) => {
  if (isSelectionMode) {
    e.stopPropagation();
    handleToggleSelection(product);
  } else {
    handleSelectProduct(product.id);
  }
}}
              style={{
                minWidth: '180px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Product Image */}
              <div style={{
                width: '100%',
                height: '120px',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
  src={product.image}
  alt={product.name}
  width={120}
  height={120}
  style={{
    objectFit: 'contain'
  }}
/>
              </div>

              {/* Selection Checkbox */}
{isSelectionMode && (
  <div style={{
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    backgroundColor: selectedProducts[product.id] ? '#2563EB' : 'white',
    border: '2px solid #2563EB',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }}>
    {selectedProducts[product.id] && (
      <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
    )}
  </div>
)}              
              {/* Product Info */}
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#000',
                  margin: '0 0 4px 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.name}
                </h4>
                
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000',
                  margin: '0 0 4px 0'
                }}>
                  ₦{product.basePrice.toLocaleString()}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: product.stockLeft <= 5 ? '#DC2626' : '#059669',
                    fontWeight: 500
                  }}>
                    {product.stockLeft <= 5 ? `Low (${product.stockLeft})` : `${product.stockLeft} left`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

      {/* Add this after CheckoutView */}
{completedTransaction && !showCheckout && (
  <ReceiptModal 
    transaction={{
      ...completedTransaction,
      createdAt: new Date(completedTransaction.createdAt)
    }}
    onClose={() => setCompletedTransaction(null)}
  />
)}

{/* Bulk Cart Modal */}
<BulkCartModal
  isOpen={showBulkCartModal}
  onClose={() => setShowBulkCartModal(false)}
  onAddToCart={handleBulkAddToCart}
/>

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