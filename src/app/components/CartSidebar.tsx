'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
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

interface CartSidebarProps {
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onCompleteSale: () => void;
  onHoldTransaction: () => void;
  onCancel: () => void;
}

export default function CartSidebar({
  cartItems,
  onRemoveItem,
  onCompleteSale,
  onHoldTransaction,
  onCancel
}: CartSidebarProps) {
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Hover state replacements for Tailwind hover utilities
  const [completeHover, setCompleteHover] = useState(false);
  const [holdHover, setHoldHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState<Record<string, boolean>>({});

  return (
    <div
      style={{
        position: 'fixed',
        backgroundColor: '#FFFFFF',
        boxShadow:
          '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        zIndex: 50,

        width: '352px',
        height: '716px',
        top: '172px',
        left:
          typeof window !== 'undefined' && window.innerWidth > 1440
            ? `${(window.innerWidth - 1440) / 2 + 1056}px`
            : '1056px',
        borderRadius: '32px',
        // keep your original var fallback
        background: 'var(--bg-white-0, #FFFFFF)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px', paddingBottom: '16px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.6%',
            color: 'var(--text-main-900, #0A0D14)',
          }}
        >
          Product Sales
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '16px',
              letterSpacing: '0%',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>

          <button
            onClick={onCancel}
            style={{
              // Tailwind text-blue-600 + hover:text-blue-700 were present,
              // but your inline color already forces this:
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '16px',
              color: 'var(--primary-base, #375DFB)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'color 150ms ease',
            }}
          >
            Hide
          </button>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          marginLeft: '24px',
          marginRight: '24px',
        }}
      ></div>

      {/* Cart Items */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '16px',
          paddingBottom: '16px',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '16px', // replaces space-y-4
        }}
      >
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '304px',
              height: '90px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            {/* Left Side - Quantity, Multiply, Image, Details */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                columnGap: '12px', // replaces space-x-3
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Quantity Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #D1D5DB', // gray-300
                  borderRadius: '4px',
                  width: '24px',
                  height: '20px',
                  paddingTop: '2px',
                  paddingRight: '3px',
                  paddingBottom: '2px',
                  paddingLeft: '3px',
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '12px',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  {item.quantity}
                </span>
              </div>

              {/* Multiplication Sign */}
              <span
                style={{
                  // text-gray-400
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                }}
              >
                ×
              </span>

              {/* Product Image */}
              <div
                style={{
                  flexShrink: 0,
                  width: '44px',
                  height: '44px',
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={44}
                  height={44}
                  style={{
                    objectFit: 'contain',
                    borderRadius: 4, // rounded
                    background: '#F9FAFB', // bg-gray-50
                    width: '44px',
                    height: '44px',
                    display: 'block',
                  }}
                />
              </div>

              {/* Product Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    // truncate + mb-1
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '4px',

                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '-0.6%',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  {item.name}
                </h3>

                <div
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: 'var(--text-main-900, #0A0D14)',
                  }}
                >
                  ₦ {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right Side - Delete Button */}
            <button
              onClick={() => onRemoveItem(item.id)}
              onMouseEnter={() =>
                setDeleteHover((prev) => ({ ...prev, [item.id]: true }))
              }
              onMouseLeave={() =>
                setDeleteHover((prev) => ({ ...prev, [item.id]: false }))
              }
              style={{
                padding: '4px', // p-1
                color: deleteHover[item.id] ? '#B91C1C' : '#EF4444', // hover:text-red-700 : text-red-500
                transition: 'color 150ms ease',
                marginLeft: '8px', // ml-2
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Remove"
            >
              <TrashIcon style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        ))}

        {cartItems.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--text-sub-500, #525866)',
              }}
            >
              No items in cart
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        

        {/* Complete Sale Button */}
        <button
          onClick={onCompleteSale}
          onMouseEnter={() => setCompleteHover(true)}
          onMouseLeave={() => setCompleteHover(false)}
          style={{
            width: '304px',
            height: '36px',
            borderRadius: '8px',
            gap: '4px',
            padding: '8px',
            background: 'var(--primary-base, #375DFB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            opacity: completeHover ? 0.9 : 1, // hover:opacity-90
            transition: 'opacity 150ms ease',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              textAlign: 'center',
              color: 'var(--text-white-0, #FFFFFF)',
            }}
          >
            Complete sale
          </span>
        </button>

        {/* Hold Transaction Button */}
        <button
          onClick={onHoldTransaction}
          onMouseEnter={() => setHoldHover(true)}
          onMouseLeave={() => setHoldHover(false)}
          style={{
            width: '304px',
            height: '36px',
            borderRadius: '8px',
            gap: '4px',
            padding: '8px',
            background: 'var(--primary-lighter, #EBF1FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            opacity: holdHover ? 0.9 : 1, // hover:opacity-90
            transition: 'opacity 150ms ease',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              textAlign: 'center',
              color: 'var(--primary-base, #375DFB)',
            }}
          >
            Hold transaction
          </span>
        </button>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          onMouseEnter={() => setCancelHover(true)}
          onMouseLeave={() => setCancelHover(false)}
          style={{
            width: '100%',
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: cancelHover ? 0.8 : 1, // hover:opacity-80
            transition: 'opacity 150ms ease',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              textAlign: 'center',
              color: 'var(--primary-base, #375DFB)',
            }}
          >
            Cancel
          </span>
        </button>
      </div>
    </div>
  );
}
