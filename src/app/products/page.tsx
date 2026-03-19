'use client';

import { useState, useMemo, useCallback, useEffect, Suspense, useRef } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store/store';
import {
  toggleProductSelection,
  selectAllProducts,
  setSelectionMode,
  type SelectedProduct
} from '../../store/selectionSlice';
import BulkCartModal from '../components/BulkCartModal';

interface CartItem {
  id: string;
  name: string;
  make?: string;
  model?: string;
  type?: string;
  capacity?: string;
  description?: string;
  image: string;
  price: number;
  quantity: number;
  productId?: string;
  unitType?: string;
  unitName?: string;
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
  customerAddress?: string;
  customerPhone?: string;
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

interface PaymentBreakdown {
  pos: number;
  transfer: number;
  cashInHand: number;
  salesOnReturn: number;
}

// Reuseable Custom Dropdown to avoid "floating" OS-native select issues
const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  width = '160px', 
  placeholder 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (value: string) => void; 
  width?: string; 
  placeholder?: string; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width, flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          backgroundColor: '#F9FAFB',
          color: '#374151',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          gap: '8px'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value === 'All' ? placeholder || label : value}
        </span>
        <ChevronDownIcon style={{ 
          width: '16px', 
          height: '16px', 
          transform: isOpen ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.2s',
          color: '#9CA3AF'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 100,
          maxHeight: '240px',
          overflowY: 'auto'
        }}>
          <div
            onClick={() => { onChange('All'); setIsOpen(false); }}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: value === 'All' ? '#F3F4F6' : 'transparent',
              fontWeight: value === 'All' ? 600 : 400
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === 'All' ? '#F3F4F6' : 'transparent'}
          >
            {placeholder || label}
          </div>
          {options.map(option => (
            <div
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: value === option ? '#F3F4F6' : 'transparent',
                fontWeight: value === option ? 600 : 400
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === option ? '#F3F4F6' : 'transparent'}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function ProductsPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<CompletedTransaction | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const dispatch = useAppDispatch();
  const { selectedProducts, isSelectionMode } = useAppSelector((state: RootState) => state.selection);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProductKind, setSelectedProductKind] = useState<string>('All');
  const [showBulkCartModal, setShowBulkCartModal] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Hooks
  const { products, loading, error, refetch } = useInventory();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update local products when products change
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const cart = useCart(localProducts);
  const pendingSales = usePendingSales();

  // Handle checkout query param
  useEffect(() => {
    const isCheckout = searchParams.get('checkout') === 'true';
    if (isCheckout) {
      setShowCheckout(true);
      setShowCart(false);
      // Clean up the URL
      const newPath = window.location.pathname;
      window.history.replaceState({}, '', newPath);
    }
  }, [searchParams]);

  // Add this effect right after the useState
  useEffect(() => {
    if (!showCheckout && cart.cartItems.length > 0) {
      setShowCart(true);
    } else if (cart.cartItems.length === 0) {
      setShowCart(false);
    }
  }, [showCheckout, cart.cartItems.length]);

  const showPendingSales = useMemo(() => pendingSales.pendingSales.length > 0 && cart.cartItems.length === 0 && !showCheckout, [pendingSales.pendingSales.length, cart.cartItems.length, showCheckout]);
  const isCompact = showCart || showCheckout;

  const categories = useMemo(() => {
    const cats = new Set(localProducts.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [localProducts]);

  const productKinds = useMemo(() => {
    // Extract unique product types/kinds
    const kinds = new Set(localProducts.map(p => p.type || (p.name ? p.name.split(' ')[0] : '')).filter(Boolean));
    return Array.from(kinds).sort();
  }, [localProducts]);

  const filteredProducts = useMemo(() => {
    let result = localProducts;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => [p.name, p.sku, p.category].some(field => field?.toLowerCase().includes(query)));
    }
    
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (selectedProductKind !== 'All') {
      result = result.filter(p => (p.type || (p.name ? p.name.split(' ')[0] : '')) === selectedProductKind);
    }
    
    return result;
  }, [localProducts, searchQuery, selectedCategory, selectedProductKind]);

  // API call
  const processSaleAPI = async (items: CartItem[], customer: CustomerDetails, paymentBreakdown: PaymentBreakdown) => {
    console.log('Items being sent to API:', items);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${apiUrl}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
      },
      body: JSON.stringify({
        items: items.map(item => ({
          ...item,
          productId: parseInt(item.id),
          quantity: item.quantity,
          unitPrice: item.price,
          unitType: item.unitType,
          unitName: item.unitName
        })),
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        paymentBreakdown,
        paymentMethod: 'Mixed',
        userId: user?.id ? parseInt(user.id) : undefined
      })
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (!result.success) {
      const errorMessage = typeof result.error === 'object'
        ? result.error.message || result.error.code || 'Failed to process sale'
        : result.error || 'Failed to process sale';
      throw new Error(errorMessage);
    }

    return result.data;
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

  const handleAddToCart = useCallback((product: Product, price: number, quantity: number, unitType?: string, unitName?: string) => {
    const success = cart.addToCart(product, price, quantity, unitType, unitName);
    if (success) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  }, [cart]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

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

  const handleBulkAddToCart = useCallback((items: Array<{
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
    let successCount = 0;
    const failedProducts: string[] = [];

    for (const item of items) {
      const fullProduct = localProducts.find(p => p.id === item.product.id);
      if (!fullProduct) {
        failedProducts.push(item.product.name);
        continue;
      }

      const success = cart.addToCart(fullProduct, item.price, item.quantity);
      if (!success) {
        failedProducts.push(item.product.name);
        continue;
      }
      successCount++;
    }

    if (failedProducts.length > 0) {
      showToast(`Failed to add: ${failedProducts.join(', ')}`, 'error');
    }

    if (successCount === 0) {
      showToast('No products were added to cart', 'error');
      return;
    }

    setShowBulkCartModal(false);
    showToast(`Successfully added ${successCount} product${successCount > 1 ? 's' : ''} to cart!`, 'success');
  }, [cart, localProducts]);

  const handleCompleteSale = useCallback(() => {
    if (cart.cartItems.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }
    setShowCheckout(true);
    setShowCart(false);
  }, [cart]);

  const handleHoldSale = useCallback(async () => {
    pendingSales.holdSale(cart.cartItems, cart.getTotalAmount());
    await cart.clearCart(true);
  }, [pendingSales, cart]);

  const handleCancelSale = useCallback(async () => {
    await cart.clearCart(true);
  }, [cart]);

  const handleBackToCart = useCallback(() => {
    if (completedTransaction) {
      cart.clearCart(false);
      setCompletedTransaction(null);
      setShowCheckout(false);
    } else {
      setShowCheckout(false);
      setShowCart(true);
    }
  }, [completedTransaction, cart]);

  const handlePrintReceipt = useCallback(async (customerDetails: CustomerDetails, paymentBreakdown: PaymentBreakdown) => {
    setIsProcessingSale(true);
    try {
      const result = await processSaleAPI(cart.cartItems, customerDetails, paymentBreakdown);
      const enhancedTransaction: CompletedTransaction = {
        id: result.transactionId || result.id || `T-${Date.now()}`,
        customer: customerDetails.name,
        customerAddress: customerDetails.address,
        customerPhone: customerDetails.phone,
        paymentBreakdown,
        total: Number(result.totalAmount || result.total || 0),
        createdAt: result.createdAt || new Date().toISOString(),
        status: 'Successful',
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
      showToast('Sale completed! Receipt ready to print.', 'success');
      await cart.clearCart(false);
      setShowCheckout(false);
    } catch (error: unknown) {
      console.error('❌ Error processing sale:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('Insufficient stock')) {
        showToast('Insufficient stock for some items. Please check inventory and try again.', 'error');
      } else if (errorMessage.includes('not found')) {
        showToast('Some products are no longer available. Please refresh and try again.', 'error');
        refetch();
      } else {
        showToast(`Failed to process sale: ${errorMessage}`, 'error');
      }
    } finally {
      setIsProcessingSale(false);
    }
  }, [cart, refetch, processSaleAPI]);

  if (loading) {
    return (
      <div style={{
        padding: '32px',
        width: '100%'
      }}>
        <EmptyState type="loading" />
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      transition: 'all 0.3s',
      width: '100%'
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
          overflow: 'auto',
          width: isCompact ? 'calc(100% - 400px)' : '100%',
          height: isCompact ? 'calc(100vh - 200px)' : '600px',
          top: isCompact ? '172px' : 'auto',
          left: isCompact ? '32px' : 'auto'
        }}
      >
        <div style={{ 
          position: 'sticky', 
          top: '-32px', 
          zIndex: 20, 
          backgroundColor: 'white',
          padding: '16px 0',
          marginBottom: '24px',
          borderBottom: '1px solid #F3F4F6',
          marginTop: '-16px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '12px',
            width: '100%'
          }}>
            {/* Category Custom Dropdown */}
            <CustomDropdown 
              label="All Categories"
              value={selectedCategory}
              options={categories}
              onChange={setSelectedCategory}
              width="180px"
            />

            {/* Search Field with Icon */}
            <div style={{
              position: 'relative',
              flex: 1,
              minWidth: '200px'
            }}>
              <MagnifyingGlassIcon style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9CA3AF'
              }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 38px',
                  fontSize: '14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  backgroundColor: '#F9FAFB',
                  outline: 'none',
                }}
              />
            </div>

            {/* Product Type Custom Dropdown */}
            <CustomDropdown 
              label="Select Product Type"
              value={selectedProductKind}
              options={productKinds}
              onChange={setSelectedProductKind}
              width="220px"
            />

            <button
              onClick={() => handleSetSelectionMode(!isSelectionMode)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                backgroundColor: isSelectionMode ? '#EF4444' : '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isSelectionMode ? 'Cancel' : 'Select Multiple'}
            </button>

            {isSelectionMode && Object.keys(selectedProducts).length > 0 && (
              <button
                onClick={() => setShowBulkCartModal(true)}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                Checkout ({Object.keys(selectedProducts).length})
              </button>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          error ? (
            <EmptyState type="error" error={error} onRetry={refetch} />
          ) : searchQuery || selectedCategory !== 'All' || selectedProductKind !== 'All' ? (
            <EmptyState type="no-search-results" searchQuery={searchQuery} />
          ) : (
            <EmptyState type="no-products" onRetry={refetch} />
          )
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '24px',
            paddingBottom: '32px'
          }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={(e) => {
                  if (isSelectionMode) {
                    e.stopPropagation();
                    handleToggleSelection(product);
                  } else {
                    handleSelectProduct(product.id);
                  }
                }}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#2563EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {product.image && product.image.trim() !== '' ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '12px'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      color: '#9CA3AF',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: selectedProducts[product.id] ? '#2563EB' : 'white',
                    border: '2px solid #2563EB',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}>
                    {selectedProducts[product.id] && (
                      <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                    )}
                  </div>
                )}

                {/* Product Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                  {/* Tooltip for Description - Moved here to be above Name */}
                  <div className="product-tooltip" style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(10px)',
                    width: '320px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    zIndex: 150,
                    visibility: 'hidden',
                    opacity: 0,
                    transition: 'opacity 0.2s, visibility 0.2s, transform 0.2s',
                    pointerEvents: 'none',
                    marginBottom: '8px'
                  }}>
                    <h5 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '10px', borderBottom: '1px solid #F3F4F6', paddingBottom: '6px' }}>
                      Full Description
                    </h5>
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                      {product.description || 'No detailed description available for this product.'}
                    </p>
                    {product.sku && (
                      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #F3F4F6', fontSize: '11px', color: '#9CA3AF' }}>
                        SKU: {product.sku}
                      </div>
                    )}
                    {/* Tooltip Arrow */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '12px',
                      height: '12px',
                      backgroundColor: 'white',
                      borderRight: '1px solid #E5E7EB',
                      borderBottom: '1px solid #E5E7EB'
                    }}></div>
                  </div>

                  {/* Line 1: Brand, Type, and Model */}
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#374151',
                    margin: 0,
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {[product.make, product.type, product.model].filter(Boolean).join(' ') || product.name}
                  </h4>

                  {/* Line 2: Price */}
                  <p style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#2563EB',
                    margin: 0
                  }}>
                    ₦{product.basePrice.toLocaleString()}
                  </p>

                  {/* Line 3: Low stock indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                    <span style={{
                      fontSize: '11px',
                      color: product.stockLeft <= 5 ? '#DC2626' : '#059669',
                      fontWeight: 600,
                      backgroundColor: product.stockLeft <= 5 ? '#FEF2F2' : '#F0FDF4',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      {product.stockLeft <= 5 ? `Low (${product.stockLeft})` : `${product.stockLeft} in stock`}
                    </span>
                  </div>
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

      {completedTransaction && !showCheckout && (
        <ReceiptModal
          transaction={{
            ...completedTransaction,
            createdAt: new Date(completedTransaction.createdAt)
          }}
          onClose={() => setCompletedTransaction(null)}
        />
      )}

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

      {/* Add keyframes for loading spinner and tooltip effects */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .product-card:hover .product-tooltip {
          visibility: visible !important;
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) !important;
        }
        .product-tooltip {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}