'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', iconPath: '/icons/dashboard.png' },
  { name: 'Products', href: '/products', iconPath: '/icons/products.png' },
  { name: 'Transactions', href: '/transactions', iconPath: '/icons/transactions.png' },
  { name: 'Returns', href: '/returns', iconPath: '/icons/returns.png' },
  { name: 'Payments', href: '/payments', iconPath: '/icons/payments.png' },
  { name: 'Exchange', href: '/exchange', iconPath: '/icons/exchange.png' },
];

// Company context based on current page
const getCompanyContext = (pathname: string) => {
  if (pathname.startsWith('/products')) {
    return {
      logoPath: '/apex-logo.png',
      companyName: 'APEX',
      department: 'Employee'
    };
  }
  
  // Default to GNC context
  return {
    logoPath: '/logo.png',
    companyName: 'GNC',
    department: 'Sales'
  };
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const companyContext = getCompanyContext(pathname);
  const { user } = useAuth();

  return (
    <>
      {/* Overlay for mobile/collapsed state */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 40,
            transition: 'opacity 0.3s'
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : '-256px',
        width: '256px',
        height: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'left 0.3s ease-in-out',
        boxShadow: isOpen ? '4px 0 12px rgba(0, 0, 0, 0.05)' : 'none'
      }}>
        {/* Logo and Company Info */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo */}
            <div style={{ width: '40px', height: '40px', position: 'relative' }}>
              <Image
                src={companyContext.logoPath}
                alt={`${companyContext.companyName} Logo`}
                width={40}
                height={40}
                style={{ borderRadius: '50%' }}
              />
            </div>
            
            {/* Company Name and Department */}
            <div>
              <h1 
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.6%',
                  color: '#0A0D14',
                  textTransform: 'uppercase',
                  margin: 0
                }}
              >
                {companyContext.companyName}
              </h1>
              <p 
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '16px',
                  letterSpacing: '0%',
                  color: '#525866',
                  margin: 0
                }}
              >
                {companyContext.department}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ 
          marginLeft: '24px', 
          marginRight: '24px', 
          borderTop: '1px solid #E5E7EB' 
        }}></div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '32px' 
        }}>
          {/* MAIN Section */}
          <div>
            <h2 
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 500,
                fontSize: '11px',
                lineHeight: '16px',
                color: '#525866',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
                margin: '0 0 16px 0'
              }}
            >
              MAIN
            </h2>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mainMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: isActive ? '#EBF8FF' : 'transparent',
                        color: isActive ? '#1D4ED8' : '#374151'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '20px', height: '20px', position: 'relative' }}>
                          <Image
                            src={item.iconPath}
                            alt={`${item.name} icon`}
                            width={20}
                            height={20}
                            style={{ opacity: isActive ? 1 : 0.6 }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '20px',
                            letterSpacing: '-0.6%',
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                      {isActive && (
                        <ChevronRightIcon style={{ width: '16px', height: '16px', color: '#1D4ED8' }} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}