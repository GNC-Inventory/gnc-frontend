'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function SalesCard() {
  const [salesAmount, setSalesAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/stats`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          setSalesAmount(result.data.totalSales || 0);
        }
      } catch (error) {
        console.error('Failed to fetch sales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <StatsCard 
      title="Sales"
      value={loading ? "Loading..." : `₦ ${salesAmount.toLocaleString()}`}
    />
  );
}