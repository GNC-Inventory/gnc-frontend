'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Transaction {
  id: string;
  items: Array<{
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
  }>;
  customer: string;
  customerAddress?: string;
  customerPhone?: string;
  paymentBreakdown?: {
  pos: number;
  transfer: number;
  cashInHand: number;
  salesOnReturn: number;
};
paymentMethod?: string; // Keep for backward compatibility
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
<div style={{ marginBottom: '24px', borderBottom: '2px solid #000', paddingBottom: '16px' }}>
  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
    <div style={{ marginRight: '16px', flexShrink: 0 }}>
      <Image
        src="/logo.png"
        alt="GNC Logo"
        width={50}
        height={50}
        style={{ display: 'block' }}
      />
    </div>
    <div style={{ flex: 1 }}>
      <h1 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        margin: 0, 
        marginBottom: '2px',
        letterSpacing: '0.5px',
        color: '#000'
      }}>
        GREAT NABUKO COMPANY NIG. LTD.
      </h1>
      <p style={{ 
        fontSize: '11px', 
        margin: 0, 
        marginBottom: '4px',
        color: '#000'
      }}>
        (REGISTERED IN NIGERIA)
      </p>
      <p style={{ 
        fontSize: '10px', 
        margin: 0, 
        marginBottom: '2px',
        color: '#000',
        lineHeight: '1.3'
      }}>
        Call For Your Industrial Electrical, Electronics Telecommunication,
      </p>
      <p style={{ 
        fontSize: '10px', 
        margin: 0, 
        marginBottom: '8px',
        color: '#000',
        lineHeight: '1.3'
      }}>
        Building Materials, Chandelier Lights, Sales, Suppliers, and General Contractors
      </p>
    </div>
    <div style={{ textAlign: 'right', fontSize: '10px', color: '#000' }}>
      <div style={{ marginBottom: '2px' }}>📞 08188294545</div>
      <div>08037075421</div>
    </div>
  </div>
  
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#000' }}>
    <div>
      <div><strong>HEAD OFFICE:</strong> 23 Bassey Duke street, calabar</div>
      <div><strong>Branch Office:</strong> 19c Bassey Duke street, calabar</div>
      <div><strong>Branch Office:</strong> 4 Bassey Duke street, calabar</div>
    </div>
    <div style={{ alignSelf: 'flex-end', fontWeight: 'bold' }}>
      1501
    </div>
  </div>
  
  <div style={{ textAlign: 'center', marginTop: '12px' }}>
    <p style={{ color: '#4B5563', fontSize: '14px', margin: 0, fontWeight: '500' }}>Sales Receipt</p>
  </div>
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
              <div style={{ gridColumn: '1 / -1' }}>
  <p style={{ color: '#4B5563', fontSize: '12px', marginBottom: '4px' }}>Payment Method</p>
  {transaction.paymentBreakdown ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {transaction.paymentBreakdown.pos > 0 && (
        <p style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '12px' }}>
          POS: ₦{transaction.paymentBreakdown.pos.toLocaleString()}
        </p>
      )}
      {transaction.paymentBreakdown.transfer > 0 && (
        <p style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '12px' }}>
          Transfer: ₦{transaction.paymentBreakdown.transfer.toLocaleString()}
        </p>
      )}
      {transaction.paymentBreakdown.cashInHand > 0 && (
        <p style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '12px' }}>
          Cash in Hand: ₦{transaction.paymentBreakdown.cashInHand.toLocaleString()}
        </p>
      )}
      {transaction.paymentBreakdown.salesOnReturn > 0 && (
        <p style={{ fontWeight: 500, color: '#111827', margin: 0, fontSize: '12px' }}>
          Sales on Return: ₦{transaction.paymentBreakdown.salesOnReturn.toLocaleString()}
        </p>
      )}
    </div>
  ) : (
    <p style={{ fontWeight: 500, color: '#111827', textTransform: 'capitalize', margin: 0 }}>
      {transaction.paymentMethod || 'Not specified'}
    </p>
  )}
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
      borderBottom: index < transaction.items.length - 1 ? '1px solid #F3F4F6' : 'none',
      paddingBottom: '12px',
      marginBottom: index < transaction.items.length - 1 ? '12px' : '0',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
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
              background: '#F9FAFB',
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
              marginBottom: '4px',
            }}
          >
            {item.name}
          </p>
          
          {/* New product details */}
          {(item.make || item.model) && (
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, marginBottom: '2px' }}>
              {[item.make, item.model].filter(Boolean).join(' ')}
            </p>
          )}
          
          {item.type && (
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, marginBottom: '2px' }}>
              Type: {item.type}
            </p>
          )}
          
          {item.capacity && (
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, marginBottom: '2px' }}>
              Capacity: {item.capacity}
            </p>
          )}
          
          <p style={{ fontSize: '12px', color: '#4B5563', margin: 0, marginTop: '4px' }}>
            ₦{item.price.toLocaleString()} × {item.quantity}
          </p>
        </div>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginLeft: '8px' }}>
        ₦{(item.price * item.quantity).toLocaleString()}
      </div>
    </div>
    
    {/* Description on separate line if it exists */}
    {item.description && (
      <div style={{ paddingLeft: '52px' }}>
        <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
          {item.description}
        </p>
      </div>
    )}
  </div>
))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: '8px' }}>
              
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '18px' }}>
  <span style={{ color: '#111827' }}>Total</span>
  <span style={{ color: '#111827' }}>
    ₦{(transaction.paymentBreakdown ? 
      Object.values(transaction.paymentBreakdown).reduce((sum, amount) => sum + amount, 0) : 
      transaction.total
    ).toLocaleString()}
  </span>
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
