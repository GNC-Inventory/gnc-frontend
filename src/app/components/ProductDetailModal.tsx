'use client';

import { useState } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from '@/utils/toast';

interface Product {
  id: string;
  name: string;
  make?: string;        // Add this
  model?: string;       // Add this
  type?: string;        // Add this
  capacity?: string;    // Add this
  description?: string; // Add this
  image: string;
  category: string;
  sku: string;
  basePrice: number;
  stockLeft: number;
  dateAdded: string;
  types?: string[];
  brands?: string[];
  sizes?: string[];
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, price: number, quantity: number) => void;
  onInventoryUpdate?: (productId: string, newStockLeft: number) => void;
}

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart,
  onInventoryUpdate
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  if (value === '' || value === '0') {
    setQuantity(0);
  } else {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= (product?.stockLeft || 1)) {
      setQuantity(numValue);
    }
  }
};

// ❌ REMOVED: deductInventory function - inventory will be deducted at checkout instead
// This prevents inventory from being stuck when customers abandon their carts

const handleAddItem = () => {
  if (!product || !onAddToCart) return;
  if (quantity > product.stockLeft) {
    toast.error(`Only ${product.stockLeft} items available in stock`);
    return;
  }
  setIsProcessing(true);

  try {
    // ✅ CHANGED: Just add to cart without deducting inventory
    // Inventory will be validated and deducted when sale is completed at checkout
    onAddToCart(product, 0, quantity); // Price will be handled in checkout
    
    // Note: addToCart in useCart handles validation and shows error toasts
    // We show success and close modal assuming it worked
    // If validation failed, user will see error toast from addToCart
    toast.success(`${product.name} (${quantity}) added to cart`);
    setQuantity(1);
    onClose(); // Close modal after adding to cart
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Failed to add item: ${errorMessage}`);
  } finally {
    setIsProcessing(false);
  }
};

  const isAddButtonActive =
  product &&
  product.stockLeft > 0 &&
  quantity > 0 &&
  quantity <= product.stockLeft &&
  !isProcessing;

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          zIndex: 40,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          top: 0,
          left: '256px',
          right: 0,
          bottom: 0
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          backgroundColor: 'white',
          zIndex: 50,
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          width: '1104px',
          top: '140px',
          bottom: '0px',
          left: '50%',
          marginLeft: '128px',
          transform: 'translateX(-50%)',
          padding: '24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#000', marginBottom: '8px' }}>{product.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem' }}>
              <span style={{ color: '#4B5563' }}>SKU: {product.sku}</span>
              <span style={{ color: '#4B5563' }}>Category: {product.category}</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  backgroundColor:
                    product.stockLeft === 0 ? '#FEE2E2' : product.stockLeft <= 5 ? '#FFEDD5' : '#D1FAE5',
                  color: product.stockLeft === 0 ? '#B91C1C' : product.stockLeft <= 5 ? '#C2410C' : '#047857'
                }}
              >
                {product.stockLeft === 0
                  ? 'Out of Stock'
                  : product.stockLeft <= 5
                  ? `Low Stock (${product.stockLeft})`
                  : `${product.stockLeft} in stock`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <XMarkIcon style={{ width: '24px', height: '24px', color: '#6B7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Left side */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                marginBottom: '32px',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                padding: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '320px'
              }}
            >
              {product.image && product.image.trim() !== '' ? (
  <img
    src={product.image}
    alt={product.name}
    style={{
      width: '250px',
      height: '250px',
      objectFit: 'contain',
      maxHeight: '100%'
    }}
    onError={(e) => {
      console.error('Image failed to load:', e.currentTarget.src);
      e.currentTarget.style.display = 'none';
    }}
  />
) : (
  <div style={{
    width: '250px',
    height: '250px',
    backgroundColor: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '14px',
    textAlign: 'center'
  }}>
    No Image Available
  </div>
)}
            </div>

            {/* Product Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Make and Model */}
  {(product.make || product.model) && (
    <div>
      <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Make & Model</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#4B5563' }}>
        {product.make && (
          <p><span style={{ fontWeight: 500 }}>Make:</span> {product.make}</p>
        )}
        {product.model && (
          <p><span style={{ fontWeight: 500 }}>Model:</span> {product.model}</p>
        )}
      </div>
    </div>
  )}

  {/* Type and Capacity */}
  {(product.type || product.capacity) && (
    <div>
      <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Specifications</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#4B5563' }}>
        {product.type && (
          <p><span style={{ fontWeight: 500 }}>Type:</span> {product.type}</p>
        )}
        {product.capacity && (
          <p><span style={{ fontWeight: 500 }}>Capacity:</span> {product.capacity}</p>
        )}
      </div>
    </div>
  )}

  {/* Description */}
  {product.description && (
    <div>
      <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Description</h3>
      <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.5' }}>
        {product.description}
      </p>
    </div>
  )}
              {/* Types */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Type</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.types?.length ? (
                    product.types.map((type, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No types available</span>
                  )}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Brand</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.brands?.length ? (
                    product.brands.map((brand, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}
                      >
                        {brand}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No brands available</span>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Size</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes?.length ? (
                    product.sizes.map((size, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}
                      >
                        {size}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No sizes available</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 600, color: '#000' }}>Product Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#4B5563' }}>
                  <p>
                    <span style={{ fontWeight: 500 }}>Base Price:</span> ₦{formatCurrency(product.basePrice)}
                  </p>
                  <p>
                    <span style={{ fontWeight: 500 }}>Date Added:</span> {product.dateAdded}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ width: '320px' }}>
            
            {/* Quantity Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="quantity" style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 500, color: '#000' }}>
                Product Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.stockLeft}
                value={quantity === 0 ? '' : quantity}
                onChange={handleQuantityChange}
                disabled={product.stockLeft === 0 || isProcessing}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: product.stockLeft === 0 || isProcessing ? '#F3F4F6' : 'white',
                  cursor: product.stockLeft === 0 || isProcessing ? 'not-allowed' : 'text',
                  textAlign: 'center'
                }}
              />
              {product.stockLeft === 0 && (
                <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#DC2626' }}>
                  This item is out of stock and cannot be added to cart.
                </p>
              )}
              {quantity > product.stockLeft && (
                <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#DC2626' }}>
                  Quantity exceeds available stock ({product.stockLeft} available).
                </p>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddItem}
              disabled={!isAddButtonActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '160px',
                height: '40px',
                borderRadius: '8px',
                gap: '4px',
                padding: '0 16px',
                backgroundColor: isAddButtonActive ? '#2563EB' : '#D1D5DB',
                cursor: isAddButtonActive ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {isProcessing ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', marginLeft: '4px' }}>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCartIcon
                    style={{
                      width: '16px',
                      height: '16px',
                      color: isAddButtonActive ? 'white' : '#6B7280'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: isAddButtonActive ? 'white' : '#6B7280'
                    }}
                  >
                    Add item
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}