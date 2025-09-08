'use client';

import { useState } from 'react';
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
  customerAddress?: string;
  customerPhone?: string;
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
  const [closeHover, setCloseHover] = useState(false);
  const [printHover, setPrintHover] = useState(false);
  const [closeBtnHover, setCloseBtnHover] = useState(false);

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
      hour12: true,
    });
  };

  const subtotal = transaction.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const statusStyles = (() => {
    if (transaction.status === 'Successful') {
      return { background: '#D1FAE5', color: '#047857' }; // bg-green-100 text-green-700
    }
    if (transaction.status === 'Ongoing') {
      return { background: '#FFEDD5', color: '#C2410C' }; // bg-orange-100 text-orange-700
    }
    return { background: '#FEE2E2', color: '#B91C1C' }; // bg-red-100 text-red-700
  })();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0 as unknown as number, // TS quirk; inline for "inset-0"
        background: 'rgba(0,0,0,0.5)', // bg-black bg-opacity-50
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          boxShadow:
            '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          maxWidth: '28rem', // max-w-md
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#111827',
              margin: 0,
            }}
          >
            Receipt
          </h2>
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHover(true)}
            onMouseLeave={() => setCloseHover(false)}
            style={{
              color: closeHover ? '#4B5563' : '#9CA3AF', // hover -> text-gray-600; default text-gray-400
              transition: 'color 150ms ease',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>

        {/* Receipt Content */}
        <div style={{ padding: '24px' }} id="receipt-content">
          {/* Company Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '12px',
                position: 'relative',
              }}
            >
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={64}
                height={64}
                style={{ borderRadius: '9999px', display: 'block' }}
              />
            </div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: '4px',
                color: '#111827',
              }}
            >
              GREAT NABUKO
            </h3>
            <p style={{ color: '#4B5563', fontSize: '14px', margin: 0 }}>Sales Receipt</p>
          </div>

          {/* Customer Information Section */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '24px' }}>
            <h4 style={{ fontWeight: 500, color: '#111827', marginBottom: '12px' }}>Customer Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: '8px' }}>
              <div>
                <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Name</p>
                <p style={{ fontWeight: 500, color: '#111827', fontSize: '14px', margin: 0 }}>
                  {transaction.customer}
                </p>
              </div>
              {transaction.customerAddress && (
                <div>
                  <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Address</p>
                  <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>{transaction.customerAddress}</p>
                </div>
              )}
              {transaction.customerPhone && (
                <div>
                  <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Phone</p>
                  <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>{transaction.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '24px' }}>
            <h4 style={{ fontWeight: 500, color: '#111827', marginBottom: '12px' }}>Transaction Details</h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
                fontSize: '14px',
              }}
            >
              <div>
                <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Transaction ID</p>
                <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>{transaction.id}</p>
              </div>
              <div>
                <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Date</p>
                <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Time</p>
                <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>{formatTime(transaction.createdAt)}</p>
              </div>
              <div>
                <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Payment Method</p>
                <p style={{ fontWeight: 500, color: '#111827', textTransform: 'capitalize', margin: 0 }}>
                  {transaction.paymentMethod}
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Status</p>
                <span
                  style={{
                    display: 'inline-block',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 500,
                    ...statusStyles,
                  }}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '24px' }}>
            <h4 style={{ fontWeight: 500, color: '#111827', marginBottom: '16px' }}>Items Purchased</h4>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: '12px' }}>
              {transaction.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      columnGap: '12px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        style={{
                          objectFit: 'contain',
                          borderRadius: '4px',
                          background: '#F9FAFB', // gray-50
                          width: '40px',
                          height: '40px',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#111827',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#4B5563', margin: 0 }}>
                        ₦{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginLeft: '8px' }}>
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4B5563' }}>Subtotal</span>
                <span style={{ color: '#111827' }}>₦{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4B5563' }}>Tax</span>
                <span style={{ color: '#111827' }}>₦0</span>
              </div>
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '18px' }}>
                  <span style={{ color: '#111827' }}>Total</span>
                  <span style={{ color: '#111827' }}>₦{transaction.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
              Thank you for your business!
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              This receipt was generated electronically
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingLeft: '24px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '16px', background: '#F9FAFB' }}>
          <div style={{ display: 'flex', columnGap: '12px' }}>
            <button
              onClick={handlePrint}
              onMouseEnter={() => setPrintHover(true)}
              onMouseLeave={() => setPrintHover(false)}
              style={{
                flex: 1,
                background: printHover ? '#1D4ED8' : '#2563EB', // hover:bg-blue-700 -> #1D4ED8, base #2563EB
                color: '#FFFFFF',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '8px',
                transition: 'background-color 150ms ease',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              onMouseEnter={() => setCloseBtnHover(true)}
              onMouseLeave={() => setCloseBtnHover(false)}
              style={{
                flex: 1,
                border: '1px solid #D1D5DB',
                color: '#374151',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '8px',
                transition: 'background-color 150ms ease',
                fontWeight: 500,
                fontSize: '14px',
                background: closeBtnHover ? '#F9FAFB' : '#FFFFFF', // hover:bg-gray-50
                cursor: 'pointer',
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
          #receipt-content,
          #receipt-content * {
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
