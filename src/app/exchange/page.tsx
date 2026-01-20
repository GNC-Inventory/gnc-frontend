'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

interface Transaction {
  id: string;
  customer: string;
  items: Array<{ id: string; name: string; image: string; price: number; quantity: number }>;
}

export default function ExchangePage() {
  const [searchId, setSearchId] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);
  const [selectedNew, setSelectedNew] = useState<any>(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [loading, setLoading] = useState(false);

  const searchTransaction = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
      });
      const result = await response.json();
      
      if (result.success) {
        const found = result.data.find((t: any) => t.id === searchId.trim());
        if (found) {
          setTransaction(found);
        } else {
          alert('Transaction not found');
        }
      }
    } catch (error) {
      alert('Error searching transaction');
    }
    setLoading(false);
  };

  const getReturnedItem = () => {
    if (!transaction || !selectedReturn) return null;
    return transaction.items.find(item => item.id === selectedReturn);
  };

  const calculateDifference = () => {
    const returnItem = getReturnedItem();
    if (!returnItem || !selectedNew) return 0;
    return (selectedNew.price * selectedNew.quantity) - (returnItem.price * returnItem.quantity);
  };

  const processExchange = () => {
    if (!selectedReturn || !selectedNew) {
      alert('Please select items to exchange');
      return;
    }
    if (!confirm('Process this exchange?')) return;
    
    alert('Exchange processed! (Backend integration needed)');
    setTransaction(null);
    setSelectedReturn(null);
    setSelectedNew(null);
    setSearchId('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F9FAFB' }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Product Exchange
            </h1>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Swap products and handle price adjustments</p>
          </div>

          {/* Search */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Find Original Purchase</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Enter Transaction ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchTransaction()}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={searchTransaction}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {transaction && (
            <>
              {/* Select Item to Return */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Select Item to Return</h2>
                {transaction.items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReturn(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      marginBottom: '8px',
                      border: `2px solid ${selectedReturn === item.id ? '#F59E0B' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedReturn === item.id ? '#FFFBEB' : 'white'
                    }}
                  >
                    <img src={item.image || '/products/placeholder.png'} alt={item.name} 
                      style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#F3F4F6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₦{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Exchange Arrow */}
              {selectedReturn && (
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <ArrowsRightLeftIcon style={{ width: '32px', height: '32px', color: '#F59E0B', margin: '0 auto' }} />
                </div>
              )}

              {/* Select Replacement (Simplified - needs product search) */}
              {selectedReturn && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Select Replacement Product</h2>
                  <input
                    type="text"
                    placeholder="Search products... (Integration needed)"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>
                    Note: Product search integration required for full functionality
                  </p>
                </div>
              )}

              {/* Price Difference (if items selected) */}
              {selectedReturn && selectedNew && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Price Adjustment</h2>
                  <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      <span>Original Value:</span>
                      <span style={{ fontWeight: 600 }}>₦{(getReturnedItem()!.price * getReturnedItem()!.quantity).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      <span>New Value:</span>
                      <span style={{ fontWeight: 600 }}>₦{(selectedNew.price * selectedNew.quantity).toLocaleString()}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: calculateDifference() > 0 ? '#FEF3C7' : '#D1FAE5',
                      borderRadius: '8px',
                      border: `1px solid ${calculateDifference() > 0 ? '#F59E0B' : '#10B981'}`
                    }}>
                      <span style={{ fontWeight: 600 }}>
                        {calculateDifference() > 0 ? 'Customer Pays:' : 'Store Credit:'}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '16px' }}>
                        ₦{Math.abs(calculateDifference()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={processExchange}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Process Exchange
                  </button>
                </div>
              )}
            </>
          )}

          {!transaction && !loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280', fontSize: '14px' }}>
              Enter a transaction ID to begin processing an exchange
            </div>
          )}
        </div>
      </div>
    </div>
  );
}