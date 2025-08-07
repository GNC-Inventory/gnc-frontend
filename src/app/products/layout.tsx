import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          title="Products" 
          subtitle="View and sell available products."
          showNewSaleButton={false}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}