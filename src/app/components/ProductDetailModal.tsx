'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { toast } from '@/utils/toast';

interface UnitConversion {
  baseUnit: string;
  retailUnit: string;
  conversionRate: number;
  basePricePerUnit: number;
  retailPricePerUnit: number;
}

interface Product {
  id: string;
  name: string;
  make?: string;
  model?: string;
  type?: string;
  capacity?: string;
  description?: string;
  image: string;
  category: string;
  sku: string;
  basePrice: number;
  stockLeft: number;
  dateAdded: string;
  types?: string[];
  brands?: string[];
  sizes?: string[];
  colour?: string;
  retailQuantity?: number;
  unitConversion?: UnitConversion | null;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, price: number, quantity: number, unitType?: string, unitName?: string) => boolean | void;
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
  const [selectedUnitType, setSelectedUnitType] = useState<'base' | 'retail'>('base');
  const [totalPrice, setTotalPrice] = useState(0);

  // Reset state when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedUnitType('base');
    }
  }, [isOpen, product?.id]);

  // Calculate total price based on selected unit type
  useEffect(() => {
    if (!product) return;

    let pricePerUnit = product.basePrice;

    if (product.unitConversion) {
      pricePerUnit = selectedUnitType === 'base'
        ? product.unitConversion.basePricePerUnit
        : product.unitConversion.retailPricePerUnit;
    }

    setTotalPrice(quantity * pricePerUnit);
  }, [quantity, selectedUnitType, product]);

  // Helper for formatting currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (!isOpen || !product) return null;

  const hasUnitConversion = !!product.unitConversion;
  const availableQuantity = hasUnitConversion && selectedUnitType === 'retail'
    ? product.retailQuantity || 0
    : product.stockLeft;

  const currentUnitName = hasUnitConversion
    ? (selectedUnitType === 'base' ? product.unitConversion!.baseUnit : product.unitConversion!.retailUnit)
    : 'Unit';

  const currentPricePerUnit = hasUnitConversion
    ? (selectedUnitType === 'base' ? product.unitConversion!.basePricePerUnit : product.unitConversion!.retailPricePerUnit)
    : product.basePrice;

  const handleAddToCart = () => {
    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} ${currentUnitName}(s) available`);
      return;
    }

    if (onAddToCart) {
      const success = onAddToCart(
        product,
        currentPricePerUnit,
        quantity,
        selectedUnitType,
        currentUnitName
      );

      // Handle both boolean return (from new Logic) and void (legacy)
      if (success !== false) {
        onClose();
        toast.success(`${product.name} (${quantity} ${currentUnitName}) added to cart`);
      }
    }
  };

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
            {/* ✅ NEW: Display colour if available */}
            {product.colour && (
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: 0,
                marginBottom: '8px'
              }}>
                Colour: <span style={{ fontWeight: 500 }}>{product.colour}</span>
              </p>
            )}
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
          <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stock Information */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px'
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', margin: 0 }}>
                Stock Availability
              </h3>
              {/* ✅ NEW: Show both base and retail quantities if unit conversion exists */}
              {hasUnitConversion ? (
                <div>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
                    <strong>{product.stockLeft}</strong> {product.unitConversion!.baseUnit}(s) available
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0' }}>
                    = <strong>{product.retailQuantity || 0}</strong> {product.unitConversion!.retailUnit}(s)
                  </p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px', margin: '8px 0 0 0' }}>
                    (1 {product.unitConversion!.baseUnit} = {product.unitConversion!.conversionRate} {product.unitConversion!.retailUnit}s)
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                  <strong>{product.stockLeft}</strong> unit(s) available
                </p>
              )}
            </div>

            {/* ✅ NEW: Unit Type Selection */}
            {hasUnitConversion && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', margin: '0 0 12px 0' }}>
                  Select Unit Type
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {/* Base Unit Button */}
                  <button
                    onClick={() => setSelectedUnitType('base')}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${selectedUnitType === 'base' ? '#2563EB' : '#E5E7EB'}`,
                      backgroundColor: selectedUnitType === 'base' ? '#EFF6FF' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#000', margin: '0 0 4px 0' }}>
                      {product.unitConversion!.baseUnit}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                      ₦{product.unitConversion!.basePricePerUnit.toLocaleString()}/{product.unitConversion!.baseUnit}
                    </p>
                  </button>

                  {/* Retail Unit Button */}
                  <button
                    onClick={() => setSelectedUnitType('retail')}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${selectedUnitType === 'retail' ? '#2563EB' : '#E5E7EB'}`,
                      backgroundColor: selectedUnitType === 'retail' ? '#EFF6FF' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#000', margin: '0 0 4px 0' }}>
                      {product.unitConversion!.retailUnit}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                      ₦{product.unitConversion!.retailPricePerUnit.toLocaleString()}/{product.unitConversion!.retailUnit}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Price Display */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#F0FDF4',
                borderRadius: '8px'
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', margin: '0 0 8px 0' }}>
                Pricing
              </h3>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#059669', margin: '0 0 4px 0' }}>
                ₦{currentPricePerUnit.toLocaleString()}
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                per {currentUnitName}
              </p>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', margin: '0 0 12px 0' }}>
                Quantity ({currentUnitName}s)
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(availableQuantity, val)));
                  }}
                  style={{
                    width: '80px',
                    height: '40px',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  min="1"
                  max={availableQuantity}
                />
                <button
                  onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>
                  Max: {availableQuantity} {currentUnitName}(s)
                </span>
              </div>
            </div>

            {/* Total Price */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Total:</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#000' }}>
                  ₦{totalPrice.toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                {quantity} {currentUnitName}(s) × ₦{currentPricePerUnit.toLocaleString()}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={availableQuantity === 0}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: availableQuantity === 0 ? '#D1D5DB' : '#2563EB',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: availableQuantity === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (availableQuantity > 0) e.currentTarget.style.backgroundColor = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                if (availableQuantity > 0) e.currentTarget.style.backgroundColor = '#2563EB';
              }}
            >
              <ShoppingCartIcon style={{ width: '20px', height: '20px' }} />
              {availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}