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
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const updateCustomerField = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePrintReceipt = () => {
    if (customerDetails.name.trim() && customerDetails.address.trim() && customerDetails.phone.trim() && paymentMethod) {
      onPrintReceipt(customerDetails, paymentMethod);
    }
  };

  const isFormValid = customerDetails.name.trim() && customerDetails.address.trim() && customerDetails.phone.trim() && paymentMethod;

  const inputStyle = "w-[304px] h-10 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelStyle = "block mb-3 text-sm font-medium text-gray-900";

  return (
    <div className="fixed bg-white z-50 w-[352px] h-[716px] top-[172px] rounded-[32px] shadow-lg"
         style={{ left: typeof window !== 'undefined' && window.innerWidth > 1440 ? `${(window.innerWidth - 1440) / 2 + 1056}px` : '1056px' }}>
      
      {/* Header */}
      <div className="p-6 pb-4">
        <button onClick={onBack} className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
          <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Return to Product Sales</span>
        </button>
        <h2 className="text-sm font-medium text-gray-900 mb-2">Checkout</h2>
        <p className="text-xs text-gray-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
      </div>

      <div className="border-t border-gray-200 mx-6 mb-6"></div>

      {/* Form Content */}
      <div className="px-6 space-y-6 overflow-y-auto h-[400px]">
        {/* Customer Name */}
        <div>
          <label htmlFor="customerName" className={labelStyle}>Customer name</label>
          <input
            type="text"
            id="customerName"
            value={customerDetails.name}
            onChange={(e) => updateCustomerField('name', e.target.value)}
            placeholder="Enter customer name"
            className={inputStyle}
          />
        </div>

        {/* Customer Address */}
        <div>
          <label htmlFor="customerAddress" className={labelStyle}>Customer address</label>
          <textarea
            id="customerAddress"
            value={customerDetails.address}
            onChange={(e) => updateCustomerField('address', e.target.value)}
            placeholder="Enter customer address"
            rows={3}
            className="w-[304px] border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* Customer Phone */}
        <div>
          <label htmlFor="customerPhone" className={labelStyle}>Customer phone number</label>
          <input
            type="tel"
            id="customerPhone"
            value={customerDetails.phone}
            onChange={(e) => updateCustomerField('phone', e.target.value)}
            placeholder="Enter phone number"
            className={inputStyle}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className={labelStyle}>Method of Payment</label>
          <div className="relative">
            <button
              onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
              className="w-[304px] h-10 border border-gray-300 rounded-lg px-3 py-2.5 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className={`text-sm ${paymentMethod ? 'text-gray-900' : 'text-gray-400'}`}>
                {paymentMethod || 'Select one...'}
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isPaymentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPaymentDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setIsPaymentDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      paymentMethod === method ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
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
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-sm font-semibold text-gray-900">₦ {totalAmount.toLocaleString()}</span>
        </div>

        <button
          onClick={handlePrintReceipt}
          disabled={!isFormValid}
          className={`w-[304px] h-9 rounded-lg mb-3 flex items-center justify-center transition-opacity ${
            isFormValid ? 'bg-blue-600 hover:opacity-90 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <span className="text-sm font-medium text-white">Print receipt</span>
        </button>

        <button onClick={onBack} className="w-full text-center hover:opacity-80 transition-opacity">
          <span className="text-sm font-medium text-blue-600">Back</span>
        </button>
      </div>
    </div>
  );
}