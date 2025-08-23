// src/components/EmptyState.tsx

'use client';

interface EmptyStateProps {
  type: 'no-products' | 'no-search-results' | 'error' | 'loading';
  searchQuery?: string;
  onRetry?: () => void;
  error?: string;
}

export default function EmptyState({ type, searchQuery, onRetry, error }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          ),
          title: 'Loading products...',
          description: 'Please wait while we fetch the latest inventory.',
          showRetry: false
        };

      case 'error':
        return {
          icon: (
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
          ),
          title: 'Failed to load products',
          description: error || 'Something went wrong while loading the inventory.',
          showRetry: true
        };

      case 'no-search-results':
        return {
          icon: (
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xl">🔍</span>
            </div>
          ),
          title: 'No products found',
          description: `No products match "${searchQuery}". Try adjusting your search terms.`,
          showRetry: false
        };

      case 'no-products':
      default:
        return {
          icon: (
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xl">📦</span>
            </div>
          ),
          title: 'No products available',
          description: 'The inventory is currently empty. Please check back later or contact support.',
          showRetry: true
        };
    }
  };

  const content = getContent();

  return (
    <div className="text-center py-12">
      {content.icon}
      
      <h3 
        className="text-lg font-medium text-gray-900 mb-2"
        style={{
          fontFamily: 'var(--font-geist), Geist, sans-serif',
        }}
      >
        {content.title}
      </h3>
      
      <p 
        className="text-gray-600 mb-6 max-w-sm mx-auto"
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: '14px',
        }}
      >
        {content.description}
      </p>
      
      {content.showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '14px',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}