'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Transaction {
  id: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  customer: string;
  paymentMethod: string;
  total: number;
  createdAt: Date;
  status: 'Successful' | 'Ongoing' | 'Failed';
}

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const subtotal = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 
            className="text-xl font-semibold text-gray-900"
            style={{
              fontFamily: 'var(--font-geist), Geist, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '24px',
            }}
          >
            Receipt
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6" id="receipt-content">
          {/* Company Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 relative">
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            <h3 
              className="font-bold text-lg mb-1"
              style={{
                fontFamily: 'var(--font-geist), Geist, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#0A0D14',
              }}
            >
              GREAT NABUKO
            </h3>
            <p 
              className="text-gray-600 text-sm"
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '12px',
                lineHeight: '16px',
              }}
            >
              Sales Receipt
            </p>
          </div>

          {/* Transaction Details */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Transaction ID</p>
                <p className="font-medium text-gray-900">{transaction.id}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Date</p>
                <p className="font-medium text-gray-900">{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Time</p>
                <p className="font-medium text-gray-900">{formatTime(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Customer</p>
                <p className="font-medium text-gray-900">{transaction.customer}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">{transaction.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <span 
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'Successful' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'Ongoing' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">Items Purchased</h4>
            <div className="space-y-4">
              {transaction.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-contain rounded bg-gray-50"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium text-gray-900 truncate"
                        style={{
                          fontFamily: 'Sora, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                        }}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        ₦{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 ml-2">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">₦0</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₦{transaction.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Thank you for your business!
            </p>
            <p className="text-xs text-gray-400">
              This receipt was generated electronically
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
              }}
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}