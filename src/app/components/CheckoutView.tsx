'use client';

import { useState, useMemo } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
}

interface CustomerDetails {
  name: string;
  address: string;
  phone: string;
}

interface PaymentBreakdown {
  pos: number;
  transfer: number;
  cashInHand: number;
  salesOnReturn: number;
}

interface CheckoutViewProps {
  cartItems: CartItem[];
  onBack: () => void;
  onPrintReceipt: (customerDetails: CustomerDetails, paymentBreakdown: PaymentBreakdown) => void;
}

export default function CheckoutView({ cartItems, onBack, onPrintReceipt }: CheckoutViewProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: 'Joseph Okoye',
    address: '',
    phone: '',
  });
  
  // Payment amounts state
  const [paymentAmounts, setPaymentAmounts] = useState<PaymentBreakdown>({
    pos: 0,
    transfer: 0,
    cashInHand: 0,
    salesOnReturn: 0,
  });

  const [backHover, setBackHover] = useState(false);
  const [printHover, setPrintHover] = useState(false);
  const [backFooterHover, setBackFooterHover] = useState(false);

  // ✅ Calculate actual cart total from items
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate running total of payment amounts
  const paymentTotal = Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);

  const updateCustomerField = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ NEW: Format currency for display
  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '';
    return amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // ✅ NEW: Parse currency input (remove commas, handle decimals)
  const parseCurrencyInput = (value: string): number => {
    if (!value || value.trim() === '') return 0;
    // Remove commas and parse
    const cleaned = value.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // ✅ IMPROVED: Handle payment amount changes with formatting
  const handlePaymentAmountChange = (field: keyof PaymentBreakdown, value: string) => {
    const numericValue = parseCurrencyInput(value);
    setPaymentAmounts((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handlePrintReceipt = () => {
    if (
      customerDetails.name.trim() &&
      customerDetails.address.trim() &&
      customerDetails.phone.trim() &&
      paymentTotal > 0
    ) {
      onPrintReceipt(customerDetails, paymentAmounts);
    }
  };

  const isFormValid =
    customerDetails.name.trim() &&
    customerDetails.address.trim() &&
    customerDetails.phone.trim() &&
    paymentTotal > 0;

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

        {/* Payment Methods */}
        <div>
          <label
            style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#111827' }}
          >
            Method of Payment
          </label>
          
          {/* POS Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="posAmount"
              style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 400, color: '#6B7280' }}
            >
              POS Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280',
                  fontSize: '14px',
                  pointerEvents: 'none',
                }}
              >
                ₦
              </span>
              <input
                type="text"
                id="posAmount"
                value={formatCurrency(paymentAmounts.pos)}
                onChange={(e) => handlePaymentAmountChange('pos', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '304px',
                  height: '40px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  paddingLeft: '28px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Transfer Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="transferAmount"
              style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 400, color: '#6B7280' }}
            >
              Transfer Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280',
                  fontSize: '14px',
                  pointerEvents: 'none',
                }}
              >
                ₦
              </span>
              <input
                type="text"
                id="transferAmount"
                value={formatCurrency(paymentAmounts.transfer)}
                onChange={(e) => handlePaymentAmountChange('transfer', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '304px',
                  height: '40px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  paddingLeft: '28px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Cash in Hand Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="cashAmount"
              style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 400, color: '#6B7280' }}
            >
              Cash in Hand Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280',
                  fontSize: '14px',
                  pointerEvents: 'none',
                }}
              >
                ₦
              </span>
              <input
                type="text"
                id="cashAmount"
                value={formatCurrency(paymentAmounts.cashInHand)}
                onChange={(e) => handlePaymentAmountChange('cashInHand', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '304px',
                  height: '40px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  paddingLeft: '28px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Sales Or Return Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="salesOnReturnAmount"
              style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 400, color: '#6B7280' }}
            >
              Sales Or Return Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280',
                  fontSize: '14px',
                  pointerEvents: 'none',
                }}
              >
                ₦
              </span>
              <input
                type="text"
                id="salesOnReturnAmount"
                value={formatCurrency(paymentAmounts.salesOnReturn)}
                onChange={(e) => handlePaymentAmountChange('salesOnReturn', e.target.value)}
                placeholder="0.00"
                style={{
                  width: '304px',
                  height: '40px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  paddingLeft: '28px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
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
        {/* Cart Total */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Cart Total</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            ₦ {cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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