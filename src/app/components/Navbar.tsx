'use client';

import { 
  Bars3Icon, 
  Cog6ToothIcon, 
  QuestionMarkCircleIcon, 
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
  title: string;
  subtitle: string;
  showNewSaleButton?: boolean;
  onMenuClick?: () => void;
}

export default function Navbar({ 
  title, 
  subtitle, 
  showNewSaleButton = true,
  onMenuClick
}: NavbarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
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
        gap: '24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%'
      }}
    >
      {/* Left side - Menu toggle and Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={onMenuClick}
          style={{
            padding: '8px',
            color: '#525866',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bars3Icon style={{ width: '24px', height: '24px' }} />
        </button>

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
      </div>

      {/* Right side - Icons and Profile */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px' 
      }}>
        {/* Support Icon */}
        <Link
          href="/support"
          style={{
            padding: '8px',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}
          title="Support"
          onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          <QuestionMarkCircleIcon style={{ width: '24px', height: '24px' }} />
        </Link>

        {/* Settings Icon */}
        <Link
          href="/settings"
          style={{
            padding: '8px',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}
          title="Settings"
          onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
        >
          <Cog6ToothIcon style={{ width: '24px', height: '24px' }} />
        </Link>

        {/* User Profile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          paddingLeft: '12px',
          borderLeft: '1px solid #E5E7EB'
        }}>
          <div style={{ 
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
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
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#0A0D14',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {getFullName()}
            </span>
          </div>
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
            <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* New Sale Button */}
        {showNewSaleButton && (
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                gap: '6px',
                borderRadius: '10px',
                padding: '0 16px',
                backgroundColor: '#375DFB',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <PlusIcon style={{ width: '16px', height: '16px' }} />
              <span style={{ fontWeight: 500, fontSize: '14px' }}>New Sale</span>
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}