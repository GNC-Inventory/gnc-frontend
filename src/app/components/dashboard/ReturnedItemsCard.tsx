'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function ReturnedItemsCard() {
  const [returnedItems, setReturnedItems] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturnedItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          const refundedSales = result.data.filter((sale: any) => sale.status === 'REFUNDED');
          const totalItems = refundedSales.reduce((sum: number, sale: any) => {
            return sum + sale.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
          }, 0);
          setReturnedItems(totalItems);
        }
      } catch (error) {
        console.error('Failed to fetch returned items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReturnedItems();
  }, []);

  return (
    <StatsCard 
      title="Total returned items"
      value={loading ? "..." : returnedItems.toString()}
    />
  );
}