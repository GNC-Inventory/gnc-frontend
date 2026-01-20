'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
  paymentBreakdown?: {
    pos: number;
    transfer: number;
    cashInHand: number;
    salesOnReturn: number;
  };
  total: number;
  createdAt: Date | null;
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
  paymentBreakdown?: {
    pos: number;
    transfer: number;
    cashInHand: number;
    salesOnReturn: number;
  };
  total: number;
  createdAt: string;
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

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/sales', {
          headers: { 
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY!
          }
        });
        
        const result: ApiResponse = await response.json();
        
        // ✅ DEBUG: Log transaction data to see image URLs
        console.log('=== TRANSACTION DATA DEBUG ===');
        if (result.data && result.data.length > 0) {
          console.log('First transaction:', result.data[0]);
          console.log('First item:', result.data[0]?.items[0]);
          console.log('Image URL:', result.data[0]?.items[0]?.image);
          console.log('Full items array:', result.data[0]?.items);
        }
        
        if (result.success) {
          const transactionsWithDates: Transaction[] = result.data
            .filter((transaction: ApiTransaction) => 
              transaction.items && 
              transaction.items.length > 0 &&
              transaction.items.every(item => item && item.name)
            )
            .map((transaction: ApiTransaction) => ({
              id: transaction.id,
              items: transaction.items,
              customer: transaction.customer,
              paymentBreakdown: transaction.paymentBreakdown,
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

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction.items || transaction.items.length === 0) return false;
    
    const matchesSearch = searchQuery.trim() === '' || 
      transaction.items.some(item => 
        item && (
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedReceipt(transaction);
    setShowReceiptModal(true);
  };

  const formatTime = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) {
      return 'TIME MISSING';
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
      fontWeight: 500,
      display: 'inline-block'
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
    if (!items || items.length === 0) return 'Unknown Product';
    
    if (items.length === 1) {
      return items[0]?.name || 'Unknown Product';
    } else {
      return `${items[0]?.name || 'Unknown Product'} & ${items.length - 1} other${items.length > 2 ? 's' : ''}`;
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      <Sidebar />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <Navbar 
          title="Transactions" 
          subtitle="Track and reference completed sales."
          showNewSaleButton={false}
        />
        
        <div style={{ 
          flex: 1, 
          padding: '32px',
          overflow: 'auto'
        }}>
          {/* Filters */}
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
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
                    outline: 'none',
                    cursor: 'pointer'
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

          {/* Search */}
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
              />
            </div>
          </div>

          {/* Table Container with Scroll */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              minWidth: '1200px',
              borderCollapse: 'collapse'
            }}>
              <thead style={{
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB'
              }}>
                <tr>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '200px'
                  }}>
                    ID
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '300px'
                  }}>
                    Product
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '100px'
                  }}>
                    Time
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '150px'
                  }}>
                    Price
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '200px'
                  }}>
                    Customer
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '120px'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#6B7280',
                    width: '130px'
                  }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '48px 24px',
                      textAlign: 'center',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px',
                      color: '#6B7280'
                    }}>
                      {transactions.length === 0 
                        ? 'No transactions found. Complete a sale to see transactions here.' 
                        : 'No transactions match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    if (!transaction.items || transaction.items.length === 0 || !transaction.items[0]) {
                      return null;
                    }

                    // ✅ DEBUG: Log each transaction's image URL
                    console.log('Rendering transaction:', transaction.id);
                    console.log('Image URL:', transaction.items[0]?.image);

                    return (
                      <tr 
                        key={transaction.id}
                        style={{
                          borderTop: '1px solid #E5E7EB',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{
                          padding: '16px 24px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          {transaction.id}
                        </td>

                        <td style={{ padding: '16px 24px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            {/* ✅ FIXED: Use regular img instead of Next Image */}
                            <img
                              src={transaction.items[0]?.image || '/products/placeholder.png'}
                              alt={transaction.items[0]?.name || 'Product'}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'contain',
                                borderRadius: '4px',
                                backgroundColor: '#F9FAFB',
                                border: '1px solid #E5E7EB'
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', transaction.items[0]?.image);
                                e.currentTarget.src = '/products/placeholder.png';
                              }}
                            />
                            <span style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontSize: '14px',
                              color: '#111827'
                            }}>
                              {getProductDisplayText(transaction.items)}
                            </span>
                          </div>
                        </td>

                        <td style={{
                          padding: '16px 24px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}>
                          {formatTime(transaction.createdAt)}
                        </td>

                        <td style={{
                          padding: '16px 24px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          ₦{transaction.total.toLocaleString()}
                        </td>

                        <td style={{
                          padding: '16px 24px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          {transaction.customer}
                        </td>

                        <td style={{ padding: '16px 24px' }}>
                          <span style={getStatusBadgeStyle(transaction.status)}>
                            {transaction.status}
                          </span>
                        </td>

                        <td style={{ padding: '16px 24px' }}>
                          <button
                            onClick={() => handleViewReceipt(transaction)}
                            style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontWeight: 500,
                              fontSize: '14px',
                              color: '#2563EB',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                          >
                            View receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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