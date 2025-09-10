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
  const [price, setPrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numericValue = input.replace(/[^\d.]/g, '');
    const decimalCount = numericValue.split('.').length - 1;
    if (decimalCount > 1) return;
    setPrice(numericValue);
    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const number = parseFloat(numericValue);
      setDisplayPrice(`₦ ${formatCurrency(number)}`);
    } else {
      setDisplayPrice('₦ ');
    }
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

  const deductInventory = async (productId: string, quantityToDeduct: number) => {
  try {
    // Add debugging logs
    console.log('=== DEDUCT INVENTORY DEBUG ===');
    console.log('Product ID:', productId);
    console.log('Quantity to deduct:', quantityToDeduct);
    console.log('API Key exists:', !!process.env.NEXT_PUBLIC_API_KEY);
    
    const url = `https://gnc-inventory-backend.onrender.com/api/admin/inventory/${productId}`;
    const requestBody = { quantity: quantityToDeduct };
    
    console.log('Request URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      console.error('Response not OK, status:', response.status);
      console.error('Response text:', responseText);
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('Parsed response:', result);
    console.log('result.success:', result.success);
    console.log('result.data:', result.data);
    console.log('typeof result.success:', typeof result.success);

    if (!result.success) {
      console.log('THROWING ERROR: result.success is false');
      console.log('result.error:', result.error);
      throw new Error(result.error || 'Failed to update inventory');
    }

    console.log('SUCCESS: About to return result.data');
    console.log('result.data structure:', result.data);
    return result.data;
  } catch (error) {
    console.error('=== DEDUCT INVENTORY ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    console.error('================================');
    throw error;
  }
};

  const handleAddItem = async () => {
    if (!product || !price || !onAddToCart) return;
    if (quantity > product.stockLeft) {
      toast.error(`Only ${product.stockLeft} items available in stock`);
      return;
    }
    setIsProcessing(true);
    toast.info(`Adding ${quantity} item(s) to cart...`);

    try {
      const updatedInventoryItem = await deductInventory(product.id, quantity);
      const updatedProduct = { ...product, stockLeft: updatedInventoryItem.stockLeft };
      if (onInventoryUpdate) onInventoryUpdate(product.id, updatedInventoryItem.stockLeft);
      onAddToCart(updatedProduct, parseFloat(price), quantity);
      toast.success(`${product.name} (${quantity}) added to cart`);
      setPrice('');
      setDisplayPrice('');
      setQuantity(1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('insufficient stock')) {
        const match = errorMessage.match(/only (\d+) available/i);
        const availableStock = match ? match[1] : 'limited';
        toast.error(`Insufficient stock! Only ${availableStock} items available. Another rep may be processing this item.`);
      } else if (errorMessage.includes('not found')) {
        toast.error('Product not found in inventory');
      } else {
        toast.error(`Failed to add item: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isAddButtonActive =
    price.trim() !== '' &&
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
              <Image
                src={product.image}
                alt={product.name}
                width={250}
                height={250}
                style={{ objectFit: 'contain', maxHeight: '100%' }}
              />
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
            {/* Price Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="price" style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 500, color: '#000' }}>
                Enter price
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="price"
                  value={displayPrice || '₦ '}
                  onChange={handlePriceChange}
                  placeholder={`₦${formatCurrency(product.basePrice)}`}
                  disabled={product.stockLeft === 0 || isProcessing}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: product.stockLeft === 0 || isProcessing ? '#F3F4F6' : 'white',
                    cursor: product.stockLeft === 0 || isProcessing ? 'not-allowed' : 'text',
                    textAlign: 'left'
                  }}
                />
                <input type="hidden" value={price} />
              </div>
            </div>

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
