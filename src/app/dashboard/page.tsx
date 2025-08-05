export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 
          className="mb-2"
          style={{
            fontFamily: 'var(--font-geist), Geist, sans-serif',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '32px',
            color: 'var(--text-main-900, #0A0D14)',
          }}
        >
          Dashboard
        </h1>
        <p 
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: 'var(--text-sub-500, #525866)',
          }}
        >
          View your recent activities.
        </p>
      </div>

      <div className="mb-6">
        <h2 
          style={{
            fontFamily: 'var(--font-geist), Geist, sans-serif',
            fontWeight: 500,
            fontSize: '28px',
            lineHeight: '36px',
            color: 'var(--text-main-900, #0A0D14)',
          }}
        >
          Welcome, Joseph
        </h2>
      </div>

      {/* Dashboard content will be added next */}
      <div className="text-gray-500">
        Dashboard content coming soon...
      </div>
    </div>
  );
}