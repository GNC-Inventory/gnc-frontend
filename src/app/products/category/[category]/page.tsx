'use client';

import { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import { useInventory, type Product } from '../../../../hooks/useInventory';
import { useCart } from '../../../../hooks/useCart';
import ProductDetailModal from '../../../components/ProductDetailModal';
import EmptyState from '../../../components/EmptyState';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { 
  toggleProductSelection, 
  selectAllProducts, 
  setSelectionMode,
  type SelectedProduct 
} from '../../../../store/selectionSlice';
import { showToast } from '../../../../utils/toast';
import BulkCartModal from '../../../components/BulkCartModal';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { products, loading, error, refetch } = useInventory();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const cart = useCart(localProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'low-stock' | 'in-stock'>('all');
  const [showBulkCartModal, setShowBulkCartModal] = useState(false);

  // Redux
  const dispatch = useAppDispatch();
  const { selectedProducts, isSelectionMode } = useAppSelector(state => state.selection);

  const categoryName = typeof params.category === 'string' ? decodeURIComponent(params.category) : '';
  const formattedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  // Sync products
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  // Filter products by category
  const categoryProducts = useMemo(() => {
    return localProducts.filter(product => 
      product.category.toLowerCase() === categoryName.toLowerCase()
    );
  }, [localProducts, categoryName]);

  // Apply search and filters
  const filteredProducts = useMemo(() => {
    let filtered = categoryProducts;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        [p.name, p.sku, p.make, p.model].some(field => 
          field?.toLowerCase().includes(query)
        )
      );
    }

    // Apply stock filter
    if (filterBy === 'low-stock') {
      filtered = filtered.filter(p => p.stockLeft <= 5);
    } else if (filterBy === 'in-stock') {
      filtered = filtered.filter(p => p.stockLeft > 5);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.basePrice - b.basePrice;
        case 'stock':
          return b.stockLeft - a.stockLeft;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [categoryProducts, searchQuery, sortBy, filterBy]);

  const handleSelectProduct = (productId: string) => {
    if (isSelectionMode) return; // Prevent opening modal in selection mode
    
    const product = localProducts.find(p => p.id === productId);
    if (product && product.stockLeft > 0) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleAddToCart = (product: Product, price: number, quantity: number) => {
    const success = cart.addToCart(product, price, quantity);
    if (success) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Redux handlers
  const handleToggleSelection = (product: Product) => {
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
  };

  const handleSelectAll = () => {
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
  };

  const handleSetSelectionMode = (mode: boolean) => {
    dispatch(setSelectionMode(mode));
  };

  const handleBulkAddToCart = (items: Array<{
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
    
    // Try to add each product
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
    
    // Show detailed feedback
    if (failedProducts.length > 0) {
      showToast(`Failed to add: ${failedProducts.join(', ')}`, 'error');
    }
    
    if (successCount === 0) {
      showToast('No products were added to cart', 'error');
      return; // Don't close modal if nothing was added
    }
    
    // Success - close modal and show success message
    setShowBulkCartModal(false);
    showToast(`Successfully added ${successCount} product${successCount > 1 ? 's' : ''} to cart!`, 'success');
  };

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
      maxWidth: '1280px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
            color: '#2563EB',
            fontSize: '14px'
          }}
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
          Back to Products
        </button>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#000',
          margin: '0 0 8px 0'
        }}>
          {formattedCategoryName}
        </h1>
        
        <p style={{
          color: '#6B7280',
          fontSize: '16px',
          margin: 0
        }}>
          {filteredProducts.length} products available
          {Object.keys(selectedProducts).length > 0 && (
            <span style={{ color: '#2563EB', marginLeft: '8px' }}>
              • {Object.keys(selectedProducts).length} selected globally
            </span>
          )}
        </p>
      </div>

      {/* Selection Controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <button
          onClick={() => handleSetSelectionMode(!isSelectionMode)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: isSelectionMode ? '#EF4444' : '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {isSelectionMode ? 'Exit Selection Mode' : 'Select Multiple'}
        </button>
        
        {isSelectionMode && (
          <>
            <button
              onClick={handleSelectAll}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Select All ({filteredProducts.length})
            </button>
            
            {Object.keys(selectedProducts).length > 0 && (
              <button
                onClick={() => setShowBulkCartModal(true)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
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

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search Bar */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          minWidth: '300px',
          height: '40px',
          padding: '0 12px',
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
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              border: 'none'
            }}
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock')}
          style={{
            padding: '8px 12px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="stock">Sort by Stock</option>
        </select>

        {/* Filter Dropdown */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as 'all' | 'low-stock' | 'in-stock')}
          style={{
            padding: '8px 12px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Products</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
        </select>
      </div>

      {/* Products Grid */}
      {error ? (
        <EmptyState type="error" error={error} onRetry={refetch} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState type="no-search-results" searchQuery={searchQuery} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                if (isSelectionMode) {
                  handleToggleSelection(product);
                } else {
                  handleSelectProduct(product.id);
                }
              }}
              style={{
                backgroundColor: 'white',
                border: selectedProducts[product.id] ? '2px solid #2563EB' : '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
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
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1
                }}>
                  {selectedProducts[product.id] && (
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
              )}

              {/* Product Image */}
              <div style={{
                width: '100%',
                height: '180px',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {product.image && product.image.trim() !== '' ? (
  <img
    src={product.image}
    alt={product.name}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    }}
    onError={(e) => {
      console.error('Image failed to load:', e.currentTarget.src);
      e.currentTarget.style.display = 'none';
    }}
    // eslint-disable-next-line @next/next/no-img-element
  />
) : (
  <div style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '14px'
  }}>
    No Image
  </div>
)}
              </div>

              {/* Product Info */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </h3>

                {(product.make || product.model) && (
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    margin: '0 0 8px 0'
                  }}>
                    {[product.make, product.model].filter(Boolean).join(' ')}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#000'
                  }}>
                    ₦{product.basePrice.toLocaleString()}
                  </span>

                  <span style={{
                    fontSize: '12px',
                    color: product.stockLeft <= 5 ? '#DC2626' : '#059669',
                    fontWeight: 500,
                    padding: '2px 8px',
                    backgroundColor: product.stockLeft <= 5 ? '#FEE2E2' : '#D1FAE5',
                    borderRadius: '12px'
                  }}>
                    {product.stockLeft <= 5 ? `Low (${product.stockLeft})` : `${product.stockLeft} available`}
                  </span>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  margin: '0'
                }}>
                  SKU: {product.sku}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAddToCart={handleAddToCart}
      />

      {/* Bulk Cart Modal */}
      <BulkCartModal
        isOpen={showBulkCartModal}
        onClose={() => setShowBulkCartModal(false)}
        onAddToCart={handleBulkAddToCart}
      />
    </div>
  );
}