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
      className="bg-white border-b border-gray-200 flex items-center justify-between"
      style={{
        height: '88px',
        paddingTop: '20px',
        paddingRight: '32px',
        paddingBottom: '20px',
        paddingLeft: '32px',
        gap: '12px',
      }}
    >
      {/* Left side - Title and subtitle */}
      <div className="flex flex-col justify-center">
        <h1 
          style={{
            fontFamily: 'var(--font-geist), Geist, sans-serif',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '24px',
            letterSpacing: '-1.5%',
            color: 'var(--text-main-900, #0A0D14)',
            marginBottom: '2px',
          }}
        >
          {title}
        </h1>
        <p 
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.6%',
            color: 'var(--text-sub-500, #525866)',
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Right side - Search, Notifications, New Sale Button */}
      <div className="flex items-center space-x-4">
        {/* Search Icon */}
        <button
          onClick={handleSearch}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>

        {/* Notification Bell Icon */}
        <button
          onClick={handleNotifications}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
          aria-label="Notifications"
        >
          <BellIcon className="w-6 h-6" />
          {/* Optional: Add notification badge */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>

        {/* New Sale Button */}
        {showNewSaleButton && (
          <button
            onClick={handleNewSale}
            className="flex items-center hover:opacity-90 transition-opacity"
            style={{
              width: '114px',
              height: '40px',
              gap: '4px',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: 'var(--primary-base, #375DFB)',
            }}
          >
            <PlusIcon className="w-4 h-4 text-white" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-white-0, #FFFFFF)',
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