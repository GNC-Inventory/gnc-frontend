'use client';

import { useState, useEffect } from 'react';
import { BanknotesIcon, CreditCardIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface PaymentStats {
  pos: { amount: number; count: number };
  transfer: { amount: number; count: number };
  cash: { amount: number; count: number };
  total: { amount: number; count: number };
}

export default function PaymentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<PaymentStats>({
    pos: { amount: 0, count: 0 },
    transfer: { amount: 0, count: 0 },
    cash: { amount: 0, count: 0 },
    total: { amount: 0, count: 0 }
  });
  const [actualCash, setActualCash] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('Today');

  // Helper to check if a date falls within a selected range
  const isDateInFilterRange = (dateStr: string, filter: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Reset times for date-only comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    switch (filter) {
      case 'Today':
        return itemDate.getTime() === today.getTime();
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return itemDate.getTime() === yesterday.getTime();
      case 'This Week':
        const sun = new Date(today);
        sun.setDate(today.getDate() - today.getDay());
        return itemDate >= sun;
      case 'This Month':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return itemDate >= firstDay;
      case 'All Time':
        return true;
      default:
        return itemDate.getTime() === today.getTime();
    }
  };

  useEffect(() => {
    loadPaymentStats();
  }, [dateFilter]);

  const loadPaymentStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
      });
      const result = await response.json();
      
      if (result.success) {
        // Calculate stats from transactions based on filter
        const filteredTransactions = result.data.filter((t: any) => 
          isDateInFilterRange(t.createdAt, dateFilter)
        );

        // Helper: get the total from the breakdown object
        const getBreakdownTotal = (pb: any) => (pb.pos || 0) + (pb.transfer || 0) + (pb.cashInHand || 0) + (pb.salesOnReturn || 0);

        const posAmount = filteredTransactions.reduce((sum: number, t: any) => {
          if (t.paymentBreakdown && getBreakdownTotal(t.paymentBreakdown) > 0) return sum + (t.paymentBreakdown.pos || 0);
          return t.paymentMethod === 'POS' ? sum + t.total : sum;
        }, 0);
        const transferAmount = filteredTransactions.reduce((sum: number, t: any) => {
          if (t.paymentBreakdown && getBreakdownTotal(t.paymentBreakdown) > 0) return sum + (t.paymentBreakdown.transfer || 0);
          return t.paymentMethod === 'Transfer' ? sum + t.total : sum;
        }, 0);
        const cashAmount = filteredTransactions.reduce((sum: number, t: any) => {
          if (t.paymentBreakdown && getBreakdownTotal(t.paymentBreakdown) > 0) return sum + (t.paymentBreakdown.cashInHand || 0);
          // Fallback: use total for cash/single-method transactions
          return (t.paymentMethod === 'Cash' || t.paymentMethod === 'CASH' || t.paymentMethod === 'Mixed') ? sum + t.total : sum;
        }, 0);

        setStats({
          pos: { 
            amount: posAmount, 
            count: filteredTransactions.filter((t: any) => 
              (t.paymentBreakdown && getBreakdownTotal(t.paymentBreakdown) > 0 && t.paymentBreakdown.pos > 0) || ((!t.paymentBreakdown || getBreakdownTotal(t.paymentBreakdown) === 0) && t.paymentMethod === 'POS')
            ).length 
          },
          transfer: { 
            amount: transferAmount, 
            count: filteredTransactions.filter((t: any) => 
              (t.paymentBreakdown && getBreakdownTotal(t.paymentBreakdown) > 0 && t.paymentBreakdown.transfer > 0) || ((!t.paymentBreakdown || getBreakdownTotal(t.paymentBreakdown) === 0) && t.paymentMethod === 'Transfer')
            ).length 
          },
          cash: { 
            amount: cashAmount, 
            count: filteredTransactions.filter((t: any) => 
              (t.paymentBreakdown && getBreakdownTotal(t.paymentBreakdown) > 0 && t.paymentBreakdown.cashInHand > 0) || ((!t.paymentBreakdown || getBreakdownTotal(t.paymentBreakdown) === 0) && (t.paymentMethod === 'Cash' || t.paymentMethod === 'CASH' || t.paymentMethod === 'Mixed'))
            ).length 
          },
          total: { 
            amount: posAmount + transferAmount + cashAmount, 
            count: filteredTransactions.length 
          }
        });
      }
    } catch (error) {
      console.error('Error loading payment stats:', error);
    }
    setLoading(false);
  };

  const getCashDifference = () => {
    const actual = parseFloat(actualCash.replace(/,/g, '')) || 0;
    return actual - stats.cash.amount;
  };

  const formatCurrency = (amount: number) => {
    return '₦' + amount.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F9FAFB' }}>
        <Navbar 
          title="Payments & Reconciliation" 
          subtitle="Loading stats..."
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F9FAFB' }}>
      <Navbar 
        title="Payments & Reconciliation" 
        subtitle="Track payment methods and reconcile daily transactions"
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div style={{ width: '100%', margin: '0' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Payments & Reconciliation
              </h1>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>Track payment methods and reconcile transactions</p>
            </div>

            {/* Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Showing:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
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
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {/* POS */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #3B82F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CreditCardIcon style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>POS</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                {formatCurrency(stats.pos.amount)}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{stats.pos.count} transactions</div>
            </div>

            {/* Transfer */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <BanknotesIcon style={{ width: '20px', height: '20px', color: '#10B981' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Transfer</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                {formatCurrency(stats.transfer.amount)}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{stats.transfer.count} transactions</div>
            </div>

            {/* Cash */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CurrencyDollarIcon style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Cash</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                {formatCurrency(stats.cash.amount)}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{stats.cash.count} transactions</div>
            </div>

            {/* Total */}
            <div style={{ backgroundColor: '#1F2937', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#9CA3AF', marginBottom: '12px' }}>
                Total Sales
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                {formatCurrency(stats.total.amount)}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{stats.total.count} transactions</div>
            </div>
          </div>

          {/* Daily Reconciliation */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: '#111827' }}>
              Daily Cash Reconciliation
            </h2>
            
            <div style={{ display: 'grid', gap: '16px', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Expected Cash:</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  {formatCurrency(stats.cash.amount)}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#111827' }}>
                  Actual Cash Count:
                </label>
                <input
                  type="text"
                  placeholder="Enter amount..."
                  value={actualCash}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setActualCash(val ? parseInt(val).toLocaleString() : '');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {actualCash && (
                <div style={{
                  padding: '12px',
                  backgroundColor: getCashDifference() === 0 ? '#D1FAE5' : getCashDifference() > 0 ? '#FEF3C7' : '#FEE2E2',
                  borderRadius: '8px',
                  border: `1px solid ${getCashDifference() === 0 ? '#10B981' : getCashDifference() > 0 ? '#F59E0B' : '#EF4444'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Difference:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>
                      {getCashDifference() > 0 ? '+' : ''}{formatCurrency(getCashDifference())}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: '#6B7280' }}>
                    {getCashDifference() === 0 ? '✓ Balanced' : getCashDifference() > 0 ? 'Over' : 'Short'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              Payment Distribution
            </h2>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: 'POS', amount: stats.pos.amount, color: '#3B82F6' },
                { label: 'Transfer', amount: stats.transfer.amount, color: '#10B981' },
                { label: 'Cash', amount: stats.cash.amount, color: '#F59E0B' }
              ].map(method => {
                const percentage = stats.total.amount > 0 
                  ? ((method.amount / stats.total.amount) * 100).toFixed(1)
                  : '0';
                
                return (
                  <div key={method.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                      <span style={{ color: '#6B7280' }}>{method.label}</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{percentage}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        backgroundColor: method.color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}