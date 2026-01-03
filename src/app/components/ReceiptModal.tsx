'use client';
import { useState } from 'react';
import Image from 'next/image';

// Add SerialPort type declaration
declare global {
  interface SerialPort {
    open(options: { baudRate: number; dataBits?: number; stopBits?: number; parity?: string }): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream | null;
    writable: WritableStream | null;
  }
}

interface Transaction {
  id: string;
  items: Array<{
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
  paymentMethod?: string;
  total: number;
  createdAt: Date;
  status: 'Successful' | 'Ongoing' | 'Failed';
}

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const [printHover, setPrintHover] = useState(false);
  const [closeBtnHover, setCloseBtnHover] = useState(false);

  const handlePrint = () => {
    console.log('Print button clicked');
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0 as unknown as number,
        background: 'rgba(0,0,0,0.5)',
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
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          maxWidth: '28rem',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >


        {/* Receipt Content */}
        <div style={{ padding: '24px' }} id="receipt-content">
          {/* Company Header */}
          <div style={{ marginBottom: '16px', borderBottom: '1px solid #000', paddingBottom: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <Image
                src="/logo.png"
                alt="GNC Logo"
                width={30}
                height={30}
                style={{ display: 'block', margin: '0 auto' }}
              />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                margin: 0, 
                marginBottom: '2px',
                letterSpacing: '0.3px',
                color: '#000',
                lineHeight: '1.2'
              }}>
                GREAT NABUKO COMPANY
              </h1>
              <h2 style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                margin: 0, 
                marginBottom: '4px',
                color: '#000'
              }}>
                NIG. LTD.
              </h2>
              <p style={{ 
                fontSize: '10px', 
                margin: 0, 
                marginBottom: '6px',
                color: '#000'
              }}>
                (REGISTERED IN NIGERIA)
              </p>
              
              <div style={{ fontSize: '9px', color: '#000', marginBottom: '6px' }}>
                <div>📞 08188294545, 08037075421</div>
              </div>
              
              <div style={{ fontSize: '8px', color: '#000', lineHeight: '1.3', marginBottom: '6px' }}>
                <div>Industrial Electrical, Electronics</div>
                <div>Telecommunication, Building Materials</div>
                <div>Chandelier Lights, Sales & Suppliers</div>
              </div>
              
              <div style={{ fontSize: '8px', color: '#000', lineHeight: '1.3', marginBottom: '8px' }}>
                <div><strong>HEAD:</strong> 23 Bassey Duke St, Calabar</div>
                <div><strong>BRANCH:</strong> 19c Bassey Duke St</div>
                <div><strong>BRANCH:</strong> 4 Bassey Duke St</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>1501</div>
                <div style={{ fontSize: '12px', fontWeight: '500' }}>Sales Receipt</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 'bold', color: '#000', marginBottom: '6px', fontSize: '11px' }}>CUSTOMER INFO</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold' }}>Name: </span>{transaction.customer}
              </div>
              {transaction.customerAddress && (
                <div style={{ marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>Address: </span>{transaction.customerAddress}
                </div>
              )}
              {transaction.customerPhone && (
                <div style={{ marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>Phone: </span>{transaction.customerPhone}
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 'bold', color: '#000', marginBottom: '6px', fontSize: '11px' }}>TRANSACTION</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold' }}>ID: </span>{transaction.id}
              </div>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold' }}>Date: </span>{formatDate(transaction.createdAt)}
              </div>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold' }}>Time: </span>{formatTime(transaction.createdAt)}
              </div>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold' }}>Status: </span>
                <span style={{ 
                  color: transaction.status === 'Successful' ? '#047857' : 
                         transaction.status === 'Ongoing' ? '#C2410C' : '#B91C1C'
                }}>
                  {transaction.status}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Payment:</span>
                {transaction.paymentBreakdown ? (
                  <div style={{ marginLeft: '4px', fontSize: '9px' }}>
                    {transaction.paymentBreakdown.pos > 0 && <div>POS: ₦{transaction.paymentBreakdown.pos.toLocaleString()}</div>}
                    {transaction.paymentBreakdown.transfer > 0 && <div>Transfer: ₦{transaction.paymentBreakdown.transfer.toLocaleString()}</div>}
                    {transaction.paymentBreakdown.cashInHand > 0 && <div>Cash: ₦{transaction.paymentBreakdown.cashInHand.toLocaleString()}</div>}
                    {transaction.paymentBreakdown.salesOnReturn > 0 && <div>Return: ₦{transaction.paymentBreakdown.salesOnReturn.toLocaleString()}</div>}
                  </div>
                ) : (
                  <span> {transaction.paymentMethod || 'Not specified'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 'bold', color: '#000', marginBottom: '6px', fontSize: '11px' }}>ITEMS</h4>
            {transaction.items.map((item, index: number) => (
              <div key={index} style={{ marginBottom: '8px', borderBottom: index < transaction.items.length - 1 ? '1px dashed #ccc' : 'none', paddingBottom: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>
                  {item.name}
                </div>
                {(item.make || item.model) && (
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>
                    {[item.make, item.model].filter(Boolean).join(' ')}
                  </div>
                )}
                {item.type && (
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>
                    Type: {item.type}
                  </div>
                )}
                {item.capacity && (
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '1px' }}>
                    Capacity: {item.capacity}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '3px' }}>
                  <span>₦{item.price.toLocaleString()} × {item.quantity}</span>
                  <span style={{ fontWeight: 'bold' }}>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
                {item.description && (
                  <div style={{ fontSize: '8px', color: '#666', marginTop: '2px', fontStyle: 'italic' }}>
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ borderTop: '2px solid #000', paddingTop: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
              <span>TOTAL</span>
              <span>₦{(transaction.paymentBreakdown ? 
                Object.values(transaction.paymentBreakdown).reduce((sum: number, amount: number) => sum + amount, 0) : 
                transaction.total
              ).toLocaleString()}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}>
              Thank you for your patronage!
            </p>
            <p style={{ fontSize: '8px', color: '#666', margin: 0 }}>
              Electronic Receipt - {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        {/* Modal Footer */}
      <div className="modal-footer" style={{ borderTop: '1px solid #E5E7EB', paddingLeft: '24px', paddingRight: '24px', paddingTop: '16px', paddingBottom: '16px', background: '#F9FAFB' }}>
          <div style={{ display: 'flex', columnGap: '12px' }}>
            <button
              onClick={handlePrint}
              onMouseEnter={() => setPrintHover(true)}
              onMouseLeave={() => setPrintHover(false)}
              style={{
                flex: 1,
                background: printHover ? '#1D4ED8' : '#2563EB',
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
                background: closeBtnHover ? '#F9FAFB' : '#FFFFFF',
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
    .modal-footer {
      display: none !important;
    }
  }
`}</style>
    </div>
  );
}