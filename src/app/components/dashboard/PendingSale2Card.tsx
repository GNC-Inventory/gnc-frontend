'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

export default function PendingSale2Card() {
  const [pendingSale, setPendingSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingSales = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY! }
        });
        const result = await response.json();
        if (result.success) {
          const pending = result.data.filter((sale: any) => sale.status === 'PENDING');
          setPendingSale(pending[1] || null);
        }
      } catch (error) {
        console.error('Failed to fetch pending sale 2:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingSales();
  }, []);

  const handleResume = () => {
    console.log('Resuming pending sale 2');
    // Handle resume logic here
  };

  if (loading) return <StatsCard title="Pending sale 2" value="Loading..." />;
  if (!pendingSale) return null;

  return (
    <StatsCard 
      title="Pending sale 2"
      value={`₦ ${Number(pendingSale.totalAmount).toLocaleString()}`}
      hasResumeLink={true}
      resumeLinkText="Resume"
      onResumeClick={handleResume}
    />
  );
}