'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartSidebarProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCompleteSale: () => void;
  onHoldTransaction: () => void;
  onCancel: () => void;
}

export default function CartSidebar({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteSale,
  onHoldTransaction,
  onCancel
}: CartSidebarProps) {
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div 
      className="fixed bg-white shadow-lg z-50"
      style={{
        width: '352px',
        height: '716px',
        top: '172px',
        left: typeof window !== 'undefined' && window.innerWidth > 1440 
          ? `${(window.innerWidth - 1440) / 2 + 1056}px` 
          : '1056px',
        borderRadius: '32px',
        backgroundColor: 'var(--bg-white-0, #FFFFFF)',
      }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
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
        
        <div className="flex justify-between items-center mt-2">
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
            className="text-blue-600 hover:text-blue-700"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '16px',
              color: 'var(--primary-base, #375DFB)',
            }}
          >
            Hide
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-6"></div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ maxHeight: '400px' }}>
        {cartItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between"
            style={{
              width: '304px',
              height: '90px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            {/* Left Side - Quantity, Multiply, Image, Details */}
            <div className="flex items-center space-x-3 flex-1">
              {/* Quantity Box */}
              <div 
                className="flex items-center justify-center border border-gray-300 rounded"
                style={{
                  width: '24px',
                  height: '20px',
                  borderRadius: '4px',
                  paddingTop: '2px',
                  paddingRight: '3px',
                  paddingBottom: '2px',
                  paddingLeft: '3px',
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
                className="text-gray-400"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '12px',
                }}
              >
                ×
              </span>

              {/* Product Image */}
              <div 
                className="flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={44}
                  height={44}
                  className="object-contain rounded bg-gray-50"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 
                  className="truncate mb-1"
                  style={{
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
                  className="text-sm"
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
              className="p-1 text-red-500 hover:text-red-700 transition-colors ml-2"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        {cartItems.length === 0 && (
          <div className="text-center py-8">
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
      <div className="p-6 pt-4 border-t border-gray-200">
        {/* Total */}
        <div 
          className="flex justify-between items-center mb-4"
          style={{
            width: '304px',
            height: '20px',
          }}
        >
          <span 
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            Total
          </span>
          <span 
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            ₦ {totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Complete Sale Button */}
        <button
          onClick={onCompleteSale}
          className="w-full mb-3 hover:opacity-90 transition-opacity flex items-center justify-center"
          style={{
            width: '304px',
            height: '36px',
            borderRadius: '8px',
            gap: '4px',
            padding: '8px',
            backgroundColor: 'var(--primary-base, #375DFB)',
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
          className="w-full mb-3 hover:opacity-90 transition-opacity flex items-center justify-center"
          style={{
            width: '304px',
            height: '36px',
            borderRadius: '8px',
            gap: '4px',
            padding: '8px',
            backgroundColor: 'var(--primary-lighter, #EBF1FF)',
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
          className="w-full text-center hover:opacity-80 transition-opacity"
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