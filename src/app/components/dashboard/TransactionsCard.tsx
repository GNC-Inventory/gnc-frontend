'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function TransactionsCard() {
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/stats`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          setTransactionCount(result.data.totalTransactions || 0);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <StatsCard 
      title="Transactions"
      value={loading ? "..." : transactionCount.toString()}
    />
  );
}