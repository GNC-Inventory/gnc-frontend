'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

interface Transaction {
  id: string;
  customer: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

export default function ReturnsPage() {
  const [searchId, setSearchId] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [returnReason, setReturnReason] = useState('defective');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
          setSelectedItems(new Set());
        } else {
          alert('Transaction not found');
          setTransaction(null);
        }
      }
    } catch (error) {
      alert('Error searching transaction');
    }
    setLoading(false);
  };

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const calculateRefund = () => {
    if (!transaction) return 0;
    return transaction.items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const processReturn = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to return');
      return;
    }

    if (!confirm('Process this return? Inventory will be updated.')) return;

    setProcessing(true);
    // TODO: Call backend API to process return
    // This will create Return record and restore inventory
    
    setTimeout(() => {
      alert('Return processed successfully!');
      setTransaction(null);
      setSelectedItems(new Set());
      setSearchId('');
      setProcessing(false);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F9FAFB' }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Returns Management
            </h1>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Process customer returns and restore inventory</p>
          </div>

          {/* Search */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Search Transaction
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <MagnifyingGlassIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Enter Transaction ID (e.g., A-1768746912273368)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTransaction()}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Transaction Details */}
          {transaction && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
                Transaction Details
              </h2>
              
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div><strong>ID:</strong> {transaction.id}</div>
                  <div><strong>Customer:</strong> {transaction.customer}</div>
                  <div><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</div>
                  <div><strong>Total:</strong> ₦{transaction.total.toLocaleString()}</div>
                </div>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                Select Items to Return
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                {transaction.items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      marginBottom: '8px',
                      border: `2px solid ${selectedItems.has(item.id) ? '#3B82F6' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedItems.has(item.id) ? '#EFF6FF' : 'white'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => {}}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <img
                      src={item.image || '/products/placeholder.png'}
                      alt={item.name}
                      style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#F3F4F6' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Quantity: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Return Reason */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#111827' }}>
                  Return Reason
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}
                >
                  <option value="defective">Defective Product</option>
                  <option value="wrong">Wrong Item Ordered</option>
                  <option value="changed_mind">Customer Changed Mind</option>
                  <option value="damaged">Damaged in Transit</option>
                  <option value="other">Other</option>
                </select>
                
                {returnReason === 'other' && (
                  <textarea
                    placeholder="Please specify reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                )}
              </div>

              {/* Refund Summary */}
              <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', marginBottom: '20px', border: '1px solid #FCD34D' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#92400E' }}>Refund Amount:</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#92400E' }}>
                    ₦{calculateRefund().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setTransaction(null);
                    setSelectedItems(new Set());
                    setSearchId('');
                  }}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    color: '#374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={processReturn}
                  disabled={processing || selectedItems.size === 0}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: selectedItems.size > 0 ? '#DC2626' : '#FCA5A5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: selectedItems.size > 0 && !processing ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {processing && <ArrowPathIcon style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                  {processing ? 'Processing...' : 'Process Return'}
                </button>
              </div>
            </div>
          )}

          {!transaction && !loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280', fontSize: '14px' }}>
              Enter a transaction ID to begin processing a return
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}