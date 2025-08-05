'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  Square3Stack3DIcon,
  ClockIcon,
  ArrowUturnLeftIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';

const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: Square3Stack3DIcon },
  { name: 'Transactions', href: '/transactions', icon: ClockIcon },
  { name: 'Returns', href: '/returns', icon: ArrowUturnLeftIcon },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Exchange', href: '/exchange', icon: ArrowsRightLeftIcon },
];

const otherMenuItems = [
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Support', href: '/support', icon: LifebuoyIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo and Company Info */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="w-10 h-10 relative">
            <Image
              src="/logo.png" // Replace with your actual logo path
              alt="GNC Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          
          {/* Company Name and Sales */}
          <div>
            <h1 
              className="uppercase"
              style={{
                fontFamily: 'var(--font-geist), Geist, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              GNC
            </h1>
            <p 
              style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                letterSpacing: '0%',
                color: 'var(--text-sub-500, #525866)',
              }}
            >
              Sales
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-gray-200"></div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-8">
        {/* MAIN Section */}
        <div>
          <h2 
            className="mb-4 uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '11px',
              lineHeight: '16px',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            MAIN
          </h2>
          
          <ul className="space-y-2">
            {mainMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
                    )}
                    <item.icon 
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`} 
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '-0.6%',
                      }}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* OTHER Section */}
        <div>
          <h2 
            className="mb-4 uppercase tracking-wider"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 500,
              fontSize: '11px',
              lineHeight: '16px',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            OTHER
          </h2>
          
          <ul className="space-y-2">
            {otherMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
                    )}
                    <item.icon 
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`} 
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '-0.6%',
                      }}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 relative">
            <Image
              src="/user-avatar.jpg" // Replace with actual user avatar
              alt="Joseph"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className="truncate"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              Joseph
            </p>
            <p 
              className="truncate"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: 'var(--text-sub-500, #525866)',
              }}
            >
              joseph@gnc.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}