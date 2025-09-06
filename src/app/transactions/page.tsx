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
  createdAt: Date;
  status: 'Successful' | 'Ongoing' | 'Failed';
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Load transactions from localStorage
  useEffect(() => {
    const loadTransactions = () => {
      try {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
          const parsed = JSON.parse(savedTransactions);
          // Convert date strings back to Date objects
          const transactionsWithDates = parsed.map((transaction: unknown) => {
            if (transaction && typeof transaction === 'object' && 'createdAt' in transaction) {
              return {
                ...transaction,
                createdAt: new Date((transaction as { createdAt: string }).createdAt)
              } as Transaction;
            }
            return transaction as Transaction;
          });
          setTransactions(transactionsWithDates);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'Successful':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'Ongoing':
        return `${baseClasses} bg-orange-100 text-orange-700`;
      case 'Failed':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar 
          title="Transactions" 
          subtitle="Track and reference completed sales."
          showNewSaleButton={false}
        />
        
        {/* Content */}
        <div className="flex-1 p-8">
          {/* Filters and Search */}
          <div className="mb-6 flex items-center justify-between">
            {/* Date Filter */}
            <div className="flex items-center space-x-4">
              <span 
                className="text-gray-600"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                }}
              >
                Showing
              </span>
              
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                  }}
                >
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="All Time">All Time</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search items by name or SKU"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-7 gap-4 px-6 py-4">
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  ID
                </div>
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Product
                </div>
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Time
                </div>
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Price
                </div>
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Customer
                </div>
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Status
                </div>
                <div 
                  className="text-left font-medium text-gray-600"
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Action
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p 
                    className="text-gray-500"
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    {transactions.length === 0 
                      ? 'No transactions found. Complete a sale to see transactions here.' 
                      : 'No transactions match your search.'}
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* ID */}
                    <div 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                      }}
                    >
                      {transaction.id}
                    </div>

                    {/* Product */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 relative flex-shrink-0">
                        <Image
                          src={transaction.items[0].image}
                          alt={transaction.items[0].name}
                          width={40}
                          height={40}
                          className="object-contain rounded bg-gray-50"
                        />
                      </div>
                      <div 
                        className="text-gray-900 truncate"
                        style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '20px',
                        }}
                      >
                        {getProductDisplayText(transaction.items)}
                      </div>
                    </div>

                    {/* Time */}
                    <div 
                      className="text-gray-600"
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                      }}
                    >
                      {formatTime(transaction.createdAt)}
                    </div>

                    {/* Price */}
                    <div 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                      }}
                    >
                      ₦ {transaction.total.toLocaleString()}
                    </div>

                    {/* Customer */}
                    <div 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                      }}
                    >
                      {transaction.customer}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      <button
                        onClick={() => handleViewReceipt(transaction)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '20px',
                        }}
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
      {showReceiptModal && selectedReceipt && (
        <ReceiptModal
          transaction={selectedReceipt}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedReceipt(null);
          }}
        />
      )}
    </div>
  );
}