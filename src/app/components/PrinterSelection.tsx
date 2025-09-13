import { useState, useEffect } from 'react';
import { Printer, Check, Usb, Globe, RefreshCw } from 'lucide-react';

// Add SerialPort type declarations at the very top
declare global {
  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
  }

  interface SerialRequestOptions {
    filters?: SerialPortFilter[];
  }

  interface SerialPort {
    open(options: { baudRate: number; dataBits?: number; stopBits?: number; parity?: string }): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream | null;
    writable: WritableStream | null;
  }

  interface NavigatorSerial {
    requestPort(options?: SerialRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }

  interface Navigator {
    serial: NavigatorSerial;
  }
}

interface PrinterType {
  name: string;
  status: 'ready' | 'busy' | 'offline';
  type: string;
  id: string;
  connection: 'usb' | 'system' | 'browser';
  port?: SerialPort;
}

interface PrinterSelectionProps {
  onPrinterSelect: (printer: string) => void;
  onPrint: (printerData?: any) => void;
  onCancel: () => void;
}

export default function PrinterSelection({ onPrinterSelect, onPrint, onCancel }: PrinterSelectionProps) {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [scanningUSB, setScanningUSB] = useState(false);

  // Check if Web Serial API is supported
  const isWebSerialSupported = () => {
    return 'serial' in navigator;
  };

  // Detect USB thermal printers using Web Serial API
  const detectUSBPrinters = async (): Promise<PrinterType[]> => {
    const usbPrinters: PrinterType[] = [];
    
    if (!isWebSerialSupported()) {
      console.log('Web Serial API not supported');
      return usbPrinters;
    }

    try {
      setScanningUSB(true);
      
      // Get already granted ports
      const grantedPorts = await navigator.serial.getPorts();
      
      grantedPorts.forEach((port, index) => {
        usbPrinters.push({
          id: `usb-granted-${index}`,
          name: `USB Thermal Printer ${index + 1}`,
          status: 'ready',
          type: 'USB Thermal Printer (Previously Connected)',
          connection: 'usb',
          port: port
        });
      });

      // Option to connect new USB printer
      usbPrinters.push({
        id: 'usb-new',
        name: 'Connect New USB Printer',
        status: 'ready',
        type: 'Click to select USB thermal printer',
        connection: 'usb'
      });

    } catch (error) {
      console.error('Error detecting USB printers:', error);
    } finally {
      setScanningUSB(false);
    }

    return usbPrinters;
  };

  // Fetch system printers from backend (fallback)
  const fetchSystemPrinters = async (): Promise<PrinterType[]> => {
    try {
      const response = await fetch('https://gnc-inventory-backend.onrender.com/api/printers');
      const data = await response.json();
      
      if (data.success) {
        return data.printers.map((printer: any, index: number) => ({
          id: `system-${index}`,
          name: printer.name,
          status: printer.status,
          type: printer.type,
          connection: 'system'
        }));
      }
    } catch (err) {
      console.error('Failed to fetch system printers:', err);
    }
    return [];
  };

  // Fetch all available printers
  const fetchPrinters = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usbPrinters, systemPrinters] = await Promise.all([
        detectUSBPrinters(),
        fetchSystemPrinters()
      ]);

      // Always include browser printer as fallback
      const browserPrinter: PrinterType = {
        id: 'browser',
        name: 'Browser Printer',
        status: 'ready',
        type: 'Print to PDF / Default printer',
        connection: 'browser'
      };

      const allPrinters = [...usbPrinters, ...systemPrinters, browserPrinter];
      setPrinters(allPrinters);
      
      // Auto-select first USB printer if available, otherwise first ready printer
      const firstUSB = allPrinters.find(p => p.connection === 'usb' && p.id !== 'usb-new');
      const firstReady = allPrinters.find(p => p.status === 'ready');
      
      if (firstUSB) {
        setSelectedPrinter(firstUSB.id);
        onPrinterSelect(firstUSB.id);
      } else if (firstReady) {
        setSelectedPrinter(firstReady.id);
        onPrinterSelect(firstReady.id);
      }
      
    } catch (err) {
      console.error('Failed to fetch printers:', err);
      setError('Failed to detect printers');
    } finally {
      setLoading(false);
    }
  };

  // Handle connecting to new USB printer
  const connectNewUSBPrinter = async () => {
    if (!isWebSerialSupported()) {
      alert('Web Serial API not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    try {
      setScanningUSB(true);
      
      // Request user to select a USB printer
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x0519 }, // Xprinter
          { usbVendorId: 0x0fe6 }, // ICS Advent
          { usbVendorId: 0x154f }, // SNBC
          { usbVendorId: 0x0dd4 }, // Voltcraft
          { usbVendorId: 0x067b }, // Prolific (common USB-Serial chip)
          { usbVendorId: 0x10c4 }, // Silicon Labs (USB-Serial chip)
          { usbVendorId: 0x1a86 }, // QinHeng Electronics (CH340 chip)
        ]
      });

      // Add the new printer to the list
      const newPrinter: PrinterType = {
        id: `usb-new-${Date.now()}`,
        name: 'USB Thermal Printer (New)',
        status: 'ready',
        type: 'USB Thermal Printer (Just Connected)',
        connection: 'usb',
        port: port
      };

      setPrinters(prev => {
        const filtered = prev.filter(p => p.id !== 'usb-new'); // Remove "Connect New" option
        return [newPrinter, ...filtered, {
          id: 'usb-new',
          name: 'Connect Another USB Printer',
          status: 'ready',
          type: 'Click to select another USB printer',
          connection: 'usb'
        }];
      });

      // Auto-select the new printer
      setSelectedPrinter(newPrinter.id);
      onPrinterSelect(newPrinter.id);
      
    } catch (err) {
      console.error('Failed to connect USB printer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if ((err as any)?.name === 'NotFoundError') {
        alert('No printer selected or printer not found.');
      } else {
        alert('Failed to connect to printer: ' + errorMessage);
      }
    } finally {
      setScanningUSB(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handlePrinterSelect = (printerId: string) => {
    if (printerId === 'usb-new') {
      connectNewUSBPrinter();
      return;
    }
    
    setSelectedPrinter(printerId);
    onPrinterSelect(printerId);
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

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb': return <Usb className="w-4 h-4 text-blue-600" />;
      case 'browser': return <Globe className="w-4 h-4 text-green-600" />;
      default: return <Printer className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Printer</h3>
            <button
              onClick={fetchPrinters}
              disabled={loading || scanningUSB}
              className="ml-auto p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Choose a printer to print your receipt
            {!isWebSerialSupported() && (
              <span className="block text-orange-600 mt-1">
                ⚠️ For USB printers, please use Chrome, Edge, or Opera browser
              </span>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {(loading || scanningUSB) && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                {scanningUSB ? 'Scanning USB ports...' : 'Detecting printers...'}
              </span>
            </div>
          )}

          {error && !loading && (
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
              <p className="text-sm text-gray-400 mt-1">
                Make sure your printer is connected and turned on
              </p>
              <button
                onClick={fetchPrinters}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          )}

          {!loading && !error && printers.length > 0 && (
            <div className="space-y-2">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  onClick={() => handlePrinterSelect(printer.id)}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedPrinter === printer.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${printer.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}
                    ${printer.id === 'usb-new' ? 'border-dashed border-blue-300 hover:border-blue-400 bg-blue-25' : ''}
                  `}
                  style={{
                    pointerEvents: printer.status === 'offline' ? 'none' : 'auto'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {getConnectionIcon(printer.connection)}
                        {selectedPrinter === printer.id && printer.id !== 'usb-new' && (
                          <Check className="w-3 h-3 text-blue-600 absolute -top-1 -right-1 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {printer.name}
                          {printer.id === 'usb-new' && scanningUSB && (
                            <span className="ml-2 text-xs text-blue-600">Connecting...</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{printer.type}</p>
                      </div>
                    </div>
                    {printer.id !== 'usb-new' && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getStatusColor(printer.status) }}
                        ></div>
                        <span className="text-xs text-gray-600">
                          {getStatusText(printer.status)}
                        </span>
                      </div>
                    )}
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
          onClick={() => onPrint(printers.find(p => p.id === selectedPrinter))}
            disabled={!selectedPrinter || loading || scanningUSB || selectedPrinter === 'usb-new'}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              ${selectedPrinter && !loading && !scanningUSB && selectedPrinter !== 'usb-new'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {loading || scanningUSB ? 'Detecting...' : 'Print Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}