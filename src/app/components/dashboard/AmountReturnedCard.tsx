'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function AmountReturnedCard() {
  const [amountReturned, setAmountReturned] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmountReturned = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          const totalRefunded = result.data
            .filter((sale: any) => sale.status === 'REFUNDED')
            .reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);
          setAmountReturned(totalRefunded);
        }
      } catch (error) {
        console.error('Failed to fetch amount returned:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAmountReturned();
  }, []);

  return (
    <StatsCard 
      title="Total amount returned"
      value={loading ? "Loading..." : `₦ ${amountReturned.toLocaleString()}`}
    />
  );
}