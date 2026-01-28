'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function TargetLeftCard() {
  const [targetLeft, setTargetLeft] = useState<number>(15000000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetLeft = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/dashboard/stats`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          const monthlyTarget = 20000000;
          const remaining = monthlyTarget - (result.data.totalSales || 0);
          setTargetLeft(remaining > 0 ? remaining : 0);
        }
      } catch (error) {
        console.error('Failed to fetch target:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTargetLeft();
  }, []);

  return (
    <StatsCard 
      title="Target left"
      value={loading ? "Loading..." : `₦ ${targetLeft.toLocaleString()}`}
    />
  );
}