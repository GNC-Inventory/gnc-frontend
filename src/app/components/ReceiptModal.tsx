'use client';
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import PrinterSelection from './PrinterSelection';
import { ClientSidePrinter, BrowserPrinter } from '../../utils/ClientSidePrinter';

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
  const [showPrinterSelection, setShowPrinterSelection] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  const handlePrint = () => {
    console.log('Print button clicked');
  setShowPrinterSelection(true);
};

const handlePrinterSelect = (printer: string) => {
  console.log('Actual print started');
  setSelectedPrinter(printer);
};

const handleActualPrint = async () => {
  console.log('Actual print started with printer:', selectedPrinter);
  
  // Close modal FIRST
  setShowPrinterSelection(false);
  
  try {
    if (selectedPrinter === 'browser' || !ClientSidePrinter.isSupported()) {
      // Use browser printing with better error handling
      const printSuccess = await BrowserPrinter.printReceipt(transaction);
      
      if (printSuccess) {
        console.log('Browser print completed');
        // Optional: show success message
        // alert('Receipt sent to printer!');
      } else {
        throw new Error('Browser print failed');
      }
    } else {
      // Use thermal printer (your existing code)
      const printer = new ClientSidePrinter();
      const connected = await printer.connect();
      
      if (!connected) {
        throw new Error('Failed to connect to printer');
      }
      
      const printSuccess = await printer.printReceipt(transaction);
      await printer.disconnect();
      
      if (!printSuccess) {
        throw new Error('Print job failed');
      }
      
      console.log('Thermal print completed');
    }
    
  } catch (error) {
    console.error('Print error:', error);
    alert('Print failed: ' + (error as Error).message + '\n\nPlease check your printer connection or try again.');
  }
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
          {/* Company Header - Optimized for 80mm thermal printer */}
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

          {/* Customer Information Section - Optimized */}
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

          {/* Transaction Details - Optimized */}
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
          {/* Items - Optimized for thermal */}
<div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginBottom: '12px' }}>
  <h4 style={{ fontWeight: 'bold', color: '#000', marginBottom: '6px', fontSize: '11px' }}>ITEMS</h4>
  {transaction.items.map((item, index) => (
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

          {/* Totals - Optimized */}
<div style={{ borderTop: '2px solid #000', paddingTop: '8px', marginBottom: '12px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
    <span>TOTAL</span>
    <span>₦{(transaction.paymentBreakdown ? 
      Object.values(transaction.paymentBreakdown).reduce((sum, amount) => sum + amount, 0) : 
      transaction.total
    ).toLocaleString()}</span>
  </div>
</div>

          {/* Footer - Optimized */}
<div style={{ borderTop: '1px solid #000', paddingTop: '8px', textAlign: 'center' }}>
  <p style={{ fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}>
    Thank you for your business!
  </p>
  <p style={{ fontSize: '8px', color: '#666', margin: 0 }}>
    Electronic Receipt - {new Date().toLocaleDateString()}
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

      {showPrinterSelection && (
  <PrinterSelection
    onPrinterSelect={handlePrinterSelect}
    onPrint={handleActualPrint}
    onCancel={() => setShowPrinterSelection(false)}
  />
)}

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
