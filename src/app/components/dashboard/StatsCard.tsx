interface StatsCardProps {
  title: string;
  value: string;
  hasResumeLink?: boolean;
  resumeLinkText?: string;
  onResumeClick?: () => void;
}

export default function StatsCard({ 
  title, 
  value, 
  hasResumeLink = false,
  resumeLinkText = "Resume",
  onResumeClick 
}: StatsCardProps) {
  return (
    <div 
      className="bg-white rounded-[32px] p-6"
      style={{
        width: '258px',
        height: '128px',
        gap: '16px',
      }}
    >
      {/* Title */}
      <p 
        className="mb-2"
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '20px',
          color: 'var(--text-sub-500, #525866)',
        }}
      >
        {title}
      </p>

      {/* Value */}
      <h3 
        className="mb-4"
        style={{
          fontFamily: 'var(--font-geist), Geist, sans-serif',
          fontWeight: 600,
          fontSize: '24px',
          lineHeight: '32px',
          color: 'var(--text-main-900, #0A0D14)',
        }}
      >
        {value}
      </h3>

      {/* Resume Link (if needed) */}
      {hasResumeLink && (
        <button
          onClick={onResumeClick}
          className="text-blue-600 hover:text-blue-700 transition-colors"
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
          }}
        >
          {resumeLinkText}
        </button>
      )}
    </div>
  );
}