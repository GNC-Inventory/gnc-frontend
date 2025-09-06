'use client';

import { MagnifyingGlassIcon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  title: string;
  subtitle: string;
  showNewSaleButton?: boolean;
}

export default function Navbar({ 
  title, 
  subtitle, 
  showNewSaleButton = true 
}: NavbarProps) {
  const handleNewSale = () => {
    // Handle new sale button click
    console.log('New sale clicked');
  };

  const handleSearch = () => {
    // Handle search click
    console.log('Search clicked');
  };

  const handleNotifications = () => {
    // Handle notifications click
    console.log('Notifications clicked');
  };

  return (
    <nav 
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '88px',
        paddingTop: '20px',
        paddingRight: '32px',
        paddingBottom: '20px',
        paddingLeft: '32px',
        gap: '12px',
      }}
    >
      {/* Left side - Title and subtitle */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <h1 
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '24px',
            letterSpacing: '-1.5%',
            color: '#0A0D14',
            marginBottom: '2px',
            margin: '0 0 2px 0'
          }}
        >
          {title}
        </h1>
        <p 
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.6%',
            color: '#525866',
            margin: 0
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Right side - Search, Notifications, New Sale Button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px' 
      }}>
        {/* Search Icon */}
        <button
          onClick={handleSearch}
          style={{
            padding: '8px',
            color: '#9CA3AF',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Search"
          onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          <MagnifyingGlassIcon style={{ width: '24px', height: '24px' }} />
        </button>

        {/* Notification Bell Icon */}
        <button
          onClick={handleNotifications}
          style={{
            padding: '8px',
            color: '#9CA3AF',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'color 0.2s',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Notifications"
          onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          <BellIcon style={{ width: '24px', height: '24px' }} />
          {/* Optional: Add notification badge */}
          {/* <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#EF4444',
            borderRadius: '50%'
          }}></span> */}
        </button>

        {/* New Sale Button */}
        {showNewSaleButton && (
          <button
            onClick={handleNewSale}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '114px',
              height: '40px',
              gap: '4px',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: '#375DFB',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <PlusIcon style={{ 
              width: '16px', 
              height: '16px', 
              color: 'white' 
            }} />
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'white',
              }}
            >
              New Sale
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}