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
      style={{
        backgroundColor: 'white',
        borderRadius: '32px',
        padding: '24px',
        width: '258px',
        height: '128px',
        gap: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }}
    >
      {/* Title */}
      <p 
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#525866',
          margin: '0 0 8px 0'
        }}
      >
        {title}
      </p>

      {/* Value */}
      <h3 
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 600,
          fontSize: '24px',
          lineHeight: '32px',
          color: '#0A0D14',
          margin: '0 0 16px 0'
        }}
      >
        {value}
      </h3>

      {/* Resume Link (if needed) */}
      {hasResumeLink && (
        <button
          onClick={onResumeClick}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#2563EB',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
        >
          {resumeLinkText}
        </button>
      )}
    </div>
  );
}