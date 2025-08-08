'use client';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface PendingSale {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
}

interface PendingSalesViewProps {
  pendingSales: PendingSale[];
  onResumeSale: (saleId: string) => void;
}

export default function PendingSalesView({ 
  pendingSales, 
  onResumeSale 
}: PendingSalesViewProps) {
  const getTotalItems = (items: CartItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="fixed inset-0 z-30">
      {/* Pending Sales Cards */}
      <div className="absolute" style={{ top: '172px', left: '304px' }}>
        {pendingSales.map((sale, index) => (
          <div
            key={sale.id}
            className="bg-white rounded-[32px] mb-4"
            style={{
              width: '258px',
              height: '204px',
              borderRadius: '32px',
              padding: '24px',
              gap: '16px',
              backgroundColor: 'var(--bg-white-0, #FFFFFF)',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              marginLeft: index > 0 ? `${index * 280}px` : '0px',
              position: index > 0 ? 'absolute' : 'relative',
              left: index > 0 ? '0px' : 'auto',
            }}
          >
            {/* Pending Sale Title */}
            <h3
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '-1.1%',
                color: 'var(--text-sub-500, #525866)',
                marginBottom: '8px',
              }}
            >
              Pending sale {index + 1}
            </h3>

            {/* Items Count */}
            <p
              style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-soft-400, #868C98)',
                marginBottom: '16px',
              }}
            >
              {getTotalItems(sale.items)} item{getTotalItems(sale.items) !== 1 ? 's' : ''}
            </p>

            {/* Total Price */}
            <h2
              style={{
                fontFamily: 'var(--font-geist), Geist, sans-serif',
                fontWeight: 500,
                fontSize: '32px',
                lineHeight: '40px',
                letterSpacing: '0%',
                color: 'var(--text-main-900, #0A0D14)',
                marginBottom: '16px',
              }}
            >
              ₦ {sale.total.toLocaleString()}
            </h2>

            {/* Resume Link */}
            <button
              onClick={() => onResumeSale(sale.id)}
              className="w-full text-center hover:opacity-80 transition-opacity"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                textAlign: 'center',
                color: 'var(--primary-base, #375DFB)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Resume
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}