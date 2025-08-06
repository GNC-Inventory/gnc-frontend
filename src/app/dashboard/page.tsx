'use client';

import { useState } from 'react';
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

  const handleTimeFrameChange = (timeFrame: string) => {
    setSelectedTimeFrame(timeFrame);
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 
          className="mb-4"
          style={{
            fontFamily: 'var(--font-geist), Geist, sans-serif',
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '0%',
            color: 'var(--text-main-900, #0A0D14)',
          }}
        >
          Welcome, Joseph
        </h1>

        {/* Showing Dropdown */}
        <div className="flex items-center space-x-3 mb-6">
          <span 
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            Showing
          </span>
          
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              <span>{selectedTimeFrame}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {timeFrameOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleTimeFrameChange(option)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      selectedTimeFrame === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '20px',
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
      <div className="space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-4 gap-4">
          <SalesCard />
          <TransactionsCard />
          <AverageSalesCard />
          <TargetLeftCard />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-4 gap-4">
          <ReturnedItemsCard />
          <AmountReturnedCard />
          <PendingSale1Card />
          <PendingSale2Card />
        </div>
      </div>
    </div>
  );
}