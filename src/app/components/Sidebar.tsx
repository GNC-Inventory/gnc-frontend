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

const otherMenuItems = [
  { name: 'Settings', href: '/settings', iconPath: '/icons/settings.png' },
  { name: 'Support', href: '/support', iconPath: '/icons/support.png' },
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

export default function Sidebar() {
  const pathname = usePathname();
  const companyContext = getCompanyContext(pathname);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Generate user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div style={{
      width: '256px',
      height: '100vh',
      backgroundColor: 'white',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo and Company Info */}
      <div style={{ padding: '24px' }}>
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

        {/* OTHER Section */}
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
            OTHER
          </h2>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {otherMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
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

      {/* User Profile at Bottom */}
      <div style={{ 
        padding: '24px', 
        borderTop: '1px solid #E5E7EB' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User Avatar - Using initials instead of image */}
          <div style={{ 
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: '500',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {getUserInitials()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p 
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#0A0D14',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {getFullName()}
            </p>
            <p 
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#525866',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.email || 'Loading...'}
            </p>
          </div>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            title="Logout"
          >
            <ArrowRightOnRectangleIcon style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}