'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onPrintReceipt: (customerName: string, paymentMethod: string) => void;
}

export default function CheckoutView({
  cartItems,
  onBack,
  onPrintReceipt
}: CheckoutViewProps) {
  const [customerName, setCustomerName] = useState('Joseph Okoye');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const paymentMethods = ['POS', 'Transfer', 'Cash in hand'];

  const handlePrintReceipt = () => {
    if (customerName.trim() && paymentMethod) {
      onPrintReceipt(customerName, paymentMethod);
    }
  };

  return (
    <div 
      className="fixed bg-white z-50"
      style={{
        width: '352px',
        height: '716px',
        top: '172px',
        left: typeof window !== 'undefined' && window.innerWidth > 1440 
          ? `${(window.innerWidth - 1440) / 2 + 1056}px` 
          : '1056px',
        borderRadius: '32px',
        backgroundColor: 'var(--bg-white-0, #FFFFFF)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        {/* Return to Product Sales */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
          <span
            style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            Return to Product Sales
          </span>
        </button>

        {/* Checkout Title */}
        <h2 
          className="mb-2"
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.6%',
            color: 'var(--text-main-900, #0A0D14)',
          }}
        >
          Checkout
        </h2>
        
        {/* Items Count */}
        <p 
          className="mb-4"
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            letterSpacing: '0%',
            textAlign: 'left',
            color: 'var(--text-sub-500, #525866)',
          }}
        >
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-6 mb-6"></div>

      {/* Form Content */}
      <div className="px-6 space-y-6">
        {/* Customer Name */}
        <div>
          <label 
            htmlFor="customerName"
            className="block mb-3"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            Customer name
          </label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              width: '304px',
              height: '40px',
              borderRadius: '10px',
              gap: '8px',
              paddingTop: '10px',
              paddingRight: '10px',
              paddingBottom: '10px',
              paddingLeft: '12px',
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
            }}
          />
        </div>

        {/* Method of Payment */}
        <div>
          <label 
            className="block mb-3"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            Method of Payment
          </label>
          
          <div className="relative">
            <button
              onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                width: '304px',
                height: '40px',
                borderRadius: '10px',
                paddingTop: '10px',
                paddingRight: '10px',
                paddingBottom: '10px',
                paddingLeft: '12px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: paymentMethod ? 'var(--text-main-900, #0A0D14)' : '#9CA3AF',
                }}
              >
                {paymentMethod || 'Select one...'}
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isPaymentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isPaymentDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setIsPaymentDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      paymentMethod === method ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        {/* Total */}
        <div className="flex justify-between items-center mb-6">
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

        {/* Print Receipt Button */}
        <button
          onClick={handlePrintReceipt}
          disabled={!customerName.trim() || !paymentMethod}
          className={`w-full mb-3 flex items-center justify-center transition-opacity ${
            customerName.trim() && paymentMethod
              ? 'hover:opacity-90 cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{
            width: '304px',
            height: '36px',
            borderRadius: '8px',
            padding: '8px',
            gap: '4px',
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
            Print receipt
          </span>
        </button>

        {/* Back Button */}
        <button
          onClick={onBack}
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
            Back
          </span>
        </button>
      </div>
    </div>
  );
}