'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAllSelections } from '../../store/selectionSlice';
import { showToast } from '../../utils/toast';

interface BulkCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (items: Array<{
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
  }>) => void;
}

interface ProductPricing {
  price: number;
  quantity: number;
}

export default function BulkCartModal({ isOpen, onClose, onAddToCart }: BulkCartModalProps) {
  const dispatch = useAppDispatch();
  const { selectedProducts } = useAppSelector(state => state.selection);
  const [productPrices, setProductPrices] = useState<Record<string, ProductPricing>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const selectedProductsArray = Object.values(selectedProducts);

  const updateProductPrice = (productId: string, field: 'price' | 'quantity', value: number) => {
    setProductPrices(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        price: prev[productId]?.price || selectedProducts[productId]?.basePrice || 0,
        quantity: prev[productId]?.quantity || 1,
        [field]: value
      }
    }));
  };

  const getProductPricing = (productId: string): ProductPricing => {
    return productPrices[productId] || {
      price: selectedProducts[productId]?.basePrice || 0,
      quantity: 1
    };
  };

  const calculateTotal = () => {
    return selectedProductsArray.reduce((total, product) => {
      const pricing = getProductPricing(product.id);
      return total + (pricing.price * pricing.quantity);
    }, 0);
  };

  const handleAddAllToCart = () => {
    if (selectedProductsArray.length === 0) {
      showToast('No products selected', 'error');
      return;
    }

    // Validate that all products have valid prices and quantities
    const invalidProducts = selectedProductsArray.filter(product => {
      const pricing = getProductPricing(product.id);
      return pricing.price <= 0 || pricing.quantity <= 0 || pricing.quantity > product.stockLeft;
    });

    if (invalidProducts.length > 0) {
      showToast('Please check prices and quantities for all products', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const items = selectedProductsArray.map(product => ({
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          basePrice: product.basePrice,
          stockLeft: product.stockLeft,
          make: product.make,
          model: product.model
        },
        price: getProductPricing(product.id).price,
        quantity: getProductPricing(product.id).quantity
      }));

      onAddToCart(items); // Parent handles success/failure and modal closing
      dispatch(clearAllSelections());
    } catch (error) {
      console.error('Error adding products to cart:', error);
      showToast('Failed to add products to cart', 'error');
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => `₦${value.toLocaleString()}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 24px 16px 24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              margin: '0 0 4px 0',
              color: '#111827'
            }}>
              Add {selectedProductsArray.length} Products to Cart
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: 0
            }}>
              Set individual prices and quantities for each product
            </p>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'none',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              padding: '4px',
              borderRadius: '4px',
              opacity: isProcessing ? 0.5 : 1
            }}
          >
            <XMarkIcon style={{ width: '24px', height: '24px', color: '#6B7280' }} />
          </button>
        </div>

        {/* Products List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedProductsArray.map(product => {
              const pricing = getProductPricing(product.id);
              return (
                <div key={product.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  backgroundColor: '#F9FAFB'
                }}>
                  {/* Product Image */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      width={60}
                      height={60}
                      style={{ 
                        objectFit: 'contain' 
                      }} 
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '16px', 
                      fontWeight: 500,
                      color: '#111827'
                    }}>
                      {product.name}
                    </h4>
                    <p style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '14px', 
                      color: '#6B7280'
                    }}>
                      {product.category}
                      {(product.make || product.model) && (
                        <span> • {[product.make, product.model].filter(Boolean).join(' ')}</span>
                      )}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px', 
                      color: '#9CA3AF'
                    }}>
                      Base Price: {formatCurrency(product.basePrice)} • Stock: {product.stockLeft}
                    </p>
                  </div>

                  {/* Price Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '100px' }}>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                      Price
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={pricing.price}
                      onChange={(e) => updateProductPrice(product.id, 'price', parseFloat(e.target.value) || 0)}
                      disabled={isProcessing}
                      style={{ 
                        width: '100%',
                        padding: '8px', 
                        border: '1px solid #D1D5DB', 
                        borderRadius: '6px',
                        fontSize: '14px',
                        textAlign: 'right'
                      }}
                    />
                  </div>

                  {/* Quantity Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px' }}>
                    <label style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.stockLeft}
                      value={pricing.quantity}
                      onChange={(e) => updateProductPrice(product.id, 'quantity', parseInt(e.target.value) || 1)}
                      disabled={isProcessing}
                      style={{ 
                        width: '100%',
                        padding: '8px', 
                        border: '1px solid #D1D5DB', 
                        borderRadius: '6px',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}
                    />
                  </div>

                  {/* Subtotal */}
                  <div style={{ 
                    minWidth: '100px', 
                    textAlign: 'right',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#111827'
                  }}>
                    {formatCurrency(pricing.price * pricing.quantity)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: 'white'
        }}>
          {/* Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#F3F4F6',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
              Total Amount:
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
              {formatCurrency(calculateTotal())}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddAllToCart}
              disabled={isProcessing || selectedProductsArray.length === 0}
              style={{
                flex: 2,
                padding: '12px 16px',
                backgroundColor: isProcessing ? '#93C5FD' : '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isProcessing || selectedProductsArray.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Adding to Cart...
                </>
              ) : (
                `Add All ${selectedProductsArray.length} Products`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spinner Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}