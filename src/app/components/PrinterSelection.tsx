import { useState, useEffect } from 'react';
import { Printer, Check } from 'lucide-react';

interface PrinterType {
  name: string;
  status: 'ready' | 'busy' | 'offline';
  type: string;
}

interface PrinterSelectionProps {
  onPrinterSelect: (printer: string) => void;
  onPrint: () => void;
  onCancel: () => void;
}

export default function PrinterSelection({ onPrinterSelect, onPrint, onCancel }: PrinterSelectionProps) {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

// Fetch available printers from backend
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://gnc-inventory-backend.onrender.com/api/printers');
      const data = await response.json();
      
      if (data.success) {
        setPrinters(data.printers);
        // Auto-select first available printer
        if (data.printers.length > 0) {
          const firstAvailable = data.printers.find((p: PrinterType) => p.status === 'ready');
          if (firstAvailable) {
            setSelectedPrinter(firstAvailable.name);
            onPrinterSelect(firstAvailable.name);
          }
        }
      } else {
        setError(data.error || 'Failed to fetch printers');
      }
    } catch (err) {
      console.error('Failed to fetch printers:', err); // <-- use the variable to satisfy no-unused-vars
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handlePrinterSelect = (printerName: string) => {
    setSelectedPrinter(printerName);
    onPrinterSelect(printerName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#10B981'; // green
      case 'busy': return '#F59E0B'; // yellow
      case 'offline': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Printer</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Choose a printer to print your receipt</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Detecting printers...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️ {error}</div>
              <button
                onClick={fetchPrinters}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && printers.length === 0 && (
            <div className="text-center py-8">
              <Printer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No printers found</p>
              <p className="text-sm text-gray-400 mt-1">Make sure your printer is connected and turned on</p>
              <button
                onClick={fetchPrinters}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          )}

          {!loading && !error && printers.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {printers.map((printer) => (
                <div
                  key={printer.name}
                  onClick={() => handlePrinterSelect(printer.name)}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedPrinter === printer.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${printer.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{
                    pointerEvents: printer.status === 'offline' ? 'none' : 'auto'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Printer className="w-5 h-5 text-gray-600" />
                        {selectedPrinter === printer.name && (
                          <Check className="w-3 h-3 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{printer.name}</p>
                        <p className="text-xs text-gray-500">{printer.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(printer.status) }}
                      ></div>
                      <span className="text-xs text-gray-600">{getStatusText(printer.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onPrint}
            disabled={!selectedPrinter || loading}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedPrinter && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {loading ? 'Loading...' : 'Print Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}