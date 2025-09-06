import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <Navbar 
          title="Dashboard" 
          subtitle="View your recent activities."
        />
        <main style={{
          flex: 1,
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}