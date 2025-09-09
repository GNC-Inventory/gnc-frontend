'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ReceiptModal from '../components/ReceiptModal';

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
  createdAt: Date | null; // Allow null for missing timestamps
  status: 'Successful' | 'Ongoing' | 'Failed';
}

interface ApiTransaction {
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
  createdAt: string; // API returns string, we'll convert to Date
  status: 'Successful' | 'Ongoing' | 'Failed';
}

interface ApiResponse {
  success: boolean;
  data: ApiTransaction[];
  error?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Load transactions from localStorage
  useEffect(() => {
    const loadTransactions = async () => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/sales', {
  headers: { 
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
  }
});
    
    const result: ApiResponse = await response.json();
if (result.success) {
  const transactionsWithDates: Transaction[] = result.data.map((transaction: ApiTransaction) => ({
    id: transaction.id,
    items: transaction.items,
    customer: transaction.customer,
    paymentMethod: transaction.paymentMethod,
    total: transaction.total,
    status: transaction.status,
    createdAt: transaction.createdAt ? new Date(transaction.createdAt) : null
  }));
  setTransactions(transactionsWithDates);
    } else {
      console.error('Failed to load transactions:', result.error);
      setTransactions([]);
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    setTransactions([]);
  }
};
    loadTransactions();
  }, []);

  // Filter transactions based on search query and date
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery.trim() === '' || 
      transaction.items.some(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase());

    // For now, we'll show all transactions regardless of date filter
    // You can implement date filtering logic here based on your needs
    return matchesSearch;
  });

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedReceipt(transaction);
    setShowReceiptModal(true);
  };

  const formatTime = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) {
    return 'TIME MISSING'; // Clear indicator of data integrity issue
  }
  
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 500
    };
    
    switch (status) {
      case 'Successful':
        return { ...baseStyle, backgroundColor: '#DCFCE7', color: '#15803D' };
      case 'Ongoing':
        return { ...baseStyle, backgroundColor: '#FED7AA', color: '#C2410C' };
      case 'Failed':
        return { ...baseStyle, backgroundColor: '#FEE2E2', color: '#DC2626' };
      default:
        return { ...baseStyle, backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  const getProductDisplayText = (items: Transaction['items']) => {
    if (items.length === 1) {
      return items[0].name;
    } else {
      return `${items[0].name} & ${items.length - 1} other${items.length > 2 ? 's' : ''}`;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Navbar */}
        <Navbar 
          title="Transactions" 
          subtitle="Track and reference completed sales."
          showNewSaleButton={false}
        />
        
        {/* Content */}
        <div style={{ flex: 1, padding: '32px' }}>
          {/* Filters and Search */}
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Date Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span 
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#6B7280'
                }}
              >
                Showing
              </span>
              
              <div style={{ position: 'relative' }}>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    appearance: 'none',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px 32px 8px 16px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="All Time">All Time</option>
                </select>
                <ChevronDownIcon style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#9CA3AF',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              position: 'relative',
              maxWidth: '448px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                paddingLeft: '12px',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search items by name or SKU"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '16px',
                padding: '16px 24px'
              }}>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  ID
                </div>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  Product
                </div>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  Time
                </div>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  Price
                </div>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  Customer
                </div>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  Status
                </div>
                <div 
                  style={{
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#6B7280'
                  }}
                >
                  Action
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {filteredTransactions.length === 0 ? (
                <div style={{
                  padding: '48px 24px',
                  textAlign: 'center'
                }}>
                  <p 
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px',
                      color: '#6B7280'
                    }}
                  >
                    {transactions.length === 0 
                      ? 'No transactions found. Complete a sale to see transactions here.' 
                      : 'No transactions match your search.'}
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '16px',
                      padding: '16px 24px',
                      borderTop: index > 0 ? '1px solid #E5E7EB' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* ID */}
                    <div 
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#111827'
                      }}
                    >
                      {transaction.id}
                    </div>

                    {/* Product */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        <Image
                          src={transaction.items[0].image}
                          alt={transaction.items[0].name}
                          width={40}
                          height={40}
                          style={{
                            objectFit: 'contain',
                            borderRadius: '4px',
                            backgroundColor: '#F9FAFB'
                          }}
                        />
                      </div>
                      <div 
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#111827',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getProductDisplayText(transaction.items)}
                      </div>
                    </div>

                    {/* Time */}
                    <div 
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#6B7280'
                      }}
                    >
                      {formatTime(transaction.createdAt)}
                    </div>

                    {/* Price */}
                    <div 
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#111827'
                      }}
                    >
                      ₦ {transaction.total.toLocaleString()}
                    </div>

                    {/* Customer */}
                    <div 
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: '#111827'
                      }}
                    >
                      {transaction.customer}
                    </div>

                    {/* Status */}
                    <div>
                      <span style={getStatusBadgeStyle(transaction.status)}>
                        {transaction.status}
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      <button
                        onClick={() => handleViewReceipt(transaction)}
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '20px',
                          color: '#2563EB',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                      >
                        View receipt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && selectedReceipt.createdAt && (
  <ReceiptModal
    transaction={selectedReceipt as Transaction & { createdAt: Date }}
    onClose={() => {
      setShowReceiptModal(false);
      setSelectedReceipt(null);
    }}
  />
)}
    </div>
  );
}