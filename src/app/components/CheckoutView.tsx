'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onPrintReceipt: (customerDetails: CustomerDetails, paymentMethod: string) => void;
}

const paymentMethods = ['POS', 'Transfer', 'Cash in hand'];

export default function CheckoutView({ cartItems, onBack, onPrintReceipt }: CheckoutViewProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: 'Joseph Okoye',
    address: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const [backHover, setBackHover] = useState(false);
  const [printHover, setPrintHover] = useState(false);
  const [backFooterHover, setBackFooterHover] = useState(false);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const updateCustomerField = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrintReceipt = () => {
    if (
      customerDetails.name.trim() &&
      customerDetails.address.trim() &&
      customerDetails.phone.trim() &&
      paymentMethod
    ) {
      onPrintReceipt(customerDetails, paymentMethod);
    }
  };

  const isFormValid =
    customerDetails.name.trim() &&
    customerDetails.address.trim() &&
    customerDetails.phone.trim() &&
    paymentMethod;

  return (
    <div
      style={{
        position: 'fixed',
        background: '#FFFFFF',
        zIndex: 50,
        width: '352px',
        height: '716px',
        top: '172px',
        borderRadius: '32px',
        boxShadow:
          '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        left:
          typeof window !== 'undefined' && window.innerWidth > 1440
            ? `${(window.innerWidth - 1440) / 2 + 1056}px`
            : '1056px',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px', paddingBottom: '16px' }}>
        <button
          onClick={onBack}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            columnGap: '8px',
            marginBottom: '16px',
            opacity: backHover ? 0.8 : 1,
            transition: 'opacity 150ms ease',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px', color: '#6B7280' }} />
          <span style={{ fontSize: '14px', color: '#4B5563' }}>Return to Product Sales</span>
        </button>
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#111827',
            marginBottom: '8px',
          }}
        >
          Checkout
        </h2>
        <p style={{ fontSize: '12px', color: '#6B7280' }}>
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </p>
      </div>

      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          marginLeft: '24px',
          marginRight: '24px',
          marginBottom: '24px',
        }}
      ></div>

      {/* Form Content */}
      <div
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '24px',
          overflowY: 'auto',
          height: '400px',
        }}
      >
        {/* Customer Name */}
        <div>
          <label
            htmlFor="customerName"
            style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#111827' }}
          >
            Customer name
          </label>
          <input
            type="text"
            id="customerName"
            value={customerDetails.name}
            onChange={(e) => updateCustomerField('name', e.target.value)}
            placeholder="Enter customer name"
            style={{
              width: '304px',
              height: '40px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '10px',
              paddingBottom: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Customer Address */}
        <div>
          <label
            htmlFor="customerAddress"
            style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#111827' }}
          >
            Customer address
          </label>
          <textarea
            id="customerAddress"
            value={customerDetails.address}
            onChange={(e) => updateCustomerField('address', e.target.value)}
            placeholder="Enter customer address"
            rows={3}
            style={{
              width: '304px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '10px',
              paddingBottom: '10px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {/* Customer Phone */}
        <div>
          <label
            htmlFor="customerPhone"
            style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#111827' }}
          >
            Customer phone number
          </label>
          <input
            type="tel"
            id="customerPhone"
            value={customerDetails.phone}
            onChange={(e) => updateCustomerField('phone', e.target.value)}
            placeholder="Enter phone number"
            style={{
              width: '304px',
              height: '40px',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '10px',
              paddingBottom: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label
            style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#111827' }}
          >
            Method of Payment
          </label>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
              style={{
                width: '304px',
                height: '40px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '10px',
                paddingBottom: '10px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                outline: 'none',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '14px', color: paymentMethod ? '#111827' : '#9CA3AF' }}>
                {paymentMethod || 'Select one...'}
              </span>
              <ChevronDownIcon
                style={{
                  width: '16px',
                  height: '16px',
                  transition: 'transform 150ms ease',
                  transform: isPaymentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {isPaymentDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow:
                    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  zIndex: 10,
                }}
              >
                {paymentMethods.map((method, i) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setIsPaymentDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      fontSize: '14px',
                      background:
                        paymentMethod === method ? '#EFF6FF' : '#FFFFFF',
                      color:
                        paymentMethod === method ? '#1D4ED8' : '#374151',
                      borderTopLeftRadius: i === 0 ? '8px' : 0,
                      borderTopRightRadius: i === 0 ? '8px' : 0,
                      borderBottomLeftRadius: i === paymentMethods.length - 1 ? '8px' : 0,
                      borderBottomRightRadius: i === paymentMethods.length - 1 ? '8px' : 0,
                      cursor: 'pointer',
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
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Total</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            ₦ {totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Print Receipt */}
        <button
          onClick={handlePrintReceipt}
          disabled={!isFormValid}
          onMouseEnter={() => setPrintHover(true)}
          onMouseLeave={() => setPrintHover(false)}
          style={{
            width: '304px',
            height: '36px',
            borderRadius: '8px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 150ms ease',
            background: isFormValid ? '#2563EB' : '#D1D5DB',
            opacity: isFormValid && printHover ? 0.9 : 1,
            cursor: isFormValid ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF' }}>
            Print receipt
          </span>
        </button>

        {/* Back */}
        <button
          onClick={onBack}
          onMouseEnter={() => setBackFooterHover(true)}
          onMouseLeave={() => setBackFooterHover(false)}
          style={{
            width: '100%',
            textAlign: 'center',
            opacity: backFooterHover ? 0.8 : 1,
            transition: 'opacity 150ms ease',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#2563EB' }}>Back</span>
        </button>
      </div>
    </div>
  );
}
