// src/components/PendingSaleCard.tsx

'use client';

import { type PendingSale } from '../utils/storage';

interface PendingSaleCardProps {
  sale: PendingSale;
  index: number;
  onResume: (saleId: string) => void;
}

export default function PendingSaleCard({ sale, index, onResume }: PendingSaleCardProps) {
  const totalItems = sale.items.reduce((total, item) => total + item.quantity, 0);

  const handleResume = () => {
    onResume(sale.id);
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-lg">
      <h3 className="text-gray-600 text-base font-medium mb-2">
        Pending sale {index + 1}
      </h3>
      
      <p className="text-gray-500 text-sm mb-4">
        {totalItems} item{totalItems !== 1 ? 's' : ''}
      </p>
      
      <h2 className="text-3xl font-medium text-black mb-4">
        ₦ {sale.total.toLocaleString()}
      </h2>
      
      <button 
        onClick={handleResume}
        className="w-full text-blue-600 font-medium hover:opacity-80 transition-opacity"
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}
      >
        Resume
      </button>
    </div>
  );
}