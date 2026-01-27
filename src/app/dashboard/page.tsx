'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import SalesCard from '../components/dashboard/SalesCard';
import TransactionsCard from '../components/dashboard/TransactionsCard';
import AverageSalesCard from '../components/dashboard/AverageSalesCard';
import TargetLeftCard from '../components/dashboard/TargetLeftCard';
import ReturnedItemsCard from '../components/dashboard/ReturnedItemsCard';
import AmountReturnedCard from '../components/dashboard/AmountReturnedCard';
import PendingSale1Card from '../components/dashboard/PendingSale1Card';
import PendingSale2Card from '../components/dashboard/PendingSale2Card';

const timeFrameOptions = [
  'Today',
  'Yesterday', 
  'Last 2 days',
  'Last 3 days',
  '1 week',
  '1 month'
];

export default function DashboardPage() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('Today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  // ✅ NEW: Load user name from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Try to get first name, fall back to full name or email prefix
        const displayName = user.firstName || user.name || user.email?.split('@')[0] || 'User';
        // Capitalize first letter
        setUserName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserName('User');
    }
  }, []);

  const handleTimeFrameChange = (timeFrame: string) => {
    setSelectedTimeFrame(timeFrame);
    setIsDropdownOpen(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '0%',
            color: '#0A0D14',
            marginBottom: '16px'
          }}
        >
          Welcome, {userName}
        </h1>

        {/* Showing Dropdown */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '24px' 
        }}>
          <span 
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#525866',
            }}
          >
            Showing
          </span>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#0A0D14',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            >
              <span>{selectedTimeFrame}</span>
              <ChevronDownIcon 
                style={{ 
                  width: '16px', 
                  height: '16px',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                marginTop: '4px',
                width: '160px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 10
              }}>
                {timeFrameOptions.map((option, index) => (
                  <button
                    key={option}
                    onClick={() => handleTimeFrameChange(option)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      backgroundColor: selectedTimeFrame === option ? '#EBF8FF' : 'transparent',
                      color: selectedTimeFrame === option ? '#1D4ED8' : '#374151',
                      border: 'none',
                      borderRadius: index === 0 ? '8px 8px 0 0' : index === timeFrameOptions.length - 1 ? '0 0 8px 8px' : '0',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTimeFrame !== option) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTimeFrame !== option) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* First Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px' 
        }}>
          <SalesCard />
          <TransactionsCard />
          <AverageSalesCard />
          <TargetLeftCard />
        </div>

        {/* Second Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px' 
        }}>
          <ReturnedItemsCard />
          <AmountReturnedCard />
          <PendingSale1Card />
          <PendingSale2Card />
        </div>
      </div>
    </div>
  );
}