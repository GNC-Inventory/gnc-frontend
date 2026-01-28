'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function AverageSalesCard() {
  const [averageSales, setAverageSales] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAverageSales = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/stats`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          const avgSales = result.data.totalTransactions > 0 
            ? result.data.totalSales / result.data.totalTransactions 
            : 0;
          setAverageSales(avgSales);
        }
      } catch (error) {
        console.error('Failed to fetch average sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAverageSales();
  }, []);

  return (
    <StatsCard 
      title="Average sales"
      value={loading ? "Loading..." : `₦ ${Math.round(averageSales).toLocaleString()}`}
    />
  );
}