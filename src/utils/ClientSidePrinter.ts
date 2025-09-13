// Add these type declarations at the very top
declare global {
  // Minimal Web Serial types to avoid `any`
  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
  }

  interface SerialRequestOptions {
    filters?: SerialPortFilter[];
  }

  interface NavigatorSerial {
    requestPort(options?: SerialRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }

  interface Navigator {
    serial: NavigatorSerial;
  }
}

interface SerialPort {
  open(options: { baudRate: number; dataBits?: number; stopBits?: number; parity?: string }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream | null;
  writable: WritableStream | null;
}

interface Transaction {
  id: string;
  items: Array<{
    id: string;
    name: string;
    make?: string;
    model?: string;
    type?: string;
    capacity?: string;
    description?: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  customer: string;
  customerAddress?: string;
  customerPhone?: string;
  paymentBreakdown?: {
    pos: number;
    transfer: number;
    cashInHand: number;
    salesOnReturn: number;
  };
  total: number;
  createdAt: Date;
  status: 'Successful' | 'Ongoing' | 'Failed';
}

export class ClientSidePrinter {
  private port: SerialPort | null = null;

  // Check if Web Serial API is supported
  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  // Connect to thermal printer via USB
  async connect(): Promise<boolean> {
    if (!ClientSidePrinter.isSupported()) {
      throw new Error('Web Serial API not supported in this browser');
    }

    try {
      // Request printer port (user selects from dialog)
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x0519 }, // Xprinter
        ]
      });

      // Open connection using local variable to satisfy TS null checks
      await port.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.port = port;
      return true;
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      return false;
    }
  }

  // Print receipt to thermal printer
  async printReceipt(transaction: Transaction): Promise<boolean> {
    const port = this.port; // cache for TS narrowing
    if (!port) {
      throw new Error('Printer not connected');
    }

    try {
      const writer = port.writable?.getWriter();
      if (!writer) {
        throw new Error('Cannot get printer writer');
      }

      const commands = this.generateESCPOSCommands(transaction);
      
      for (const command of commands) {
        await writer.write(command);
      }

      writer.releaseLock();
      return true;
    } catch (error) {
      console.error('Print failed:', error);
      return false;
    }
  }

  // Generate ESC/POS commands for thermal printer
  private generateESCPOSCommands(transaction: Transaction): Uint8Array[] {
    const commands: Uint8Array[] = [];
    const encoder = new TextEncoder();

    // Initialize printer
    commands.push(new Uint8Array([0x1B, 0x40])); // ESC @

    // Center alignment
    commands.push(new Uint8Array([0x1B, 0x61, 0x01])); // ESC a 1

    // Company header (large text)
    commands.push(new Uint8Array([0x1D, 0x21, 0x11])); // Double width/height
    commands.push(encoder.encode('GREAT NABUKO COMPANY\n'));
    commands.push(new Uint8Array([0x1D, 0x21, 0x00])); // Normal size
    commands.push(encoder.encode('NIG. LTD.\n'));
    commands.push(encoder.encode('(REGISTERED IN NIGERIA)\n\n'));

    // Contact info
    commands.push(encoder.encode('Tel: 08188294545, 08037075421\n'));
    commands.push(encoder.encode('23 Bassey Duke street, calabar\n\n'));

    // Separator line
    commands.push(encoder.encode('================================\n'));
    commands.push(encoder.encode('        SALES RECEIPT\n'));
    commands.push(encoder.encode('================================\n\n'));

    // Left alignment for details
    commands.push(new Uint8Array([0x1B, 0x61, 0x00])); // ESC a 0

    // Transaction details
    commands.push(encoder.encode(`ID: ${transaction.id}\n`));
    commands.push(encoder.encode(`Date: ${transaction.createdAt.toLocaleDateString()}\n`));
    commands.push(encoder.encode(`Customer: ${transaction.customer}\n`));
    if (transaction.customerAddress) {
      commands.push(encoder.encode(`Address: ${transaction.customerAddress}\n`));
    }
    if (transaction.customerPhone) {
      commands.push(encoder.encode(`Phone: ${transaction.customerPhone}\n`));
    }
    commands.push(encoder.encode('\n'));

    // Items
    commands.push(encoder.encode('ITEMS:\n'));
    commands.push(encoder.encode('--------------------------------\n'));

    let subtotal = 0;
    transaction.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      commands.push(encoder.encode(`${index + 1}. ${item.name}\n`));
      if (item.make || item.model) {
        commands.push(encoder.encode(`   ${[item.make, item.model].filter(Boolean).join(' ')}\n`));
      }
      if (item.type) {
        commands.push(encoder.encode(`   Type: ${item.type}\n`));
      }
      if (item.capacity) {
        commands.push(encoder.encode(`   Capacity: ${item.capacity}\n`));
      }
      if (item.description) {
        commands.push(encoder.encode(`   ${item.description}\n`));
      }
      commands.push(encoder.encode(`   ${item.quantity} x N${item.price.toLocaleString()}\n`));
      commands.push(encoder.encode(`   = N${itemTotal.toLocaleString()}\n\n`));
    });

    commands.push(encoder.encode('--------------------------------\n'));

    // Calculate total
    const calculatedTotal = transaction.paymentBreakdown 
      ? Object.values(transaction.paymentBreakdown).reduce((sum, amount) => sum + amount, 0)
      : transaction.total;

    // Total (large text)
    commands.push(new Uint8Array([0x1B, 0x61, 0x02])); // Right align
    commands.push(encoder.encode(`Subtotal: N${subtotal.toLocaleString()}\n`));
    commands.push(encoder.encode(`Tax: N0\n`));
    commands.push(encoder.encode('================================\n'));
    commands.push(new Uint8Array([0x1D, 0x21, 0x11])); // Double size
    commands.push(encoder.encode(`TOTAL: N${calculatedTotal.toLocaleString()}\n`));
    commands.push(new Uint8Array([0x1D, 0x21, 0x00])); // Normal size
    commands.push(encoder.encode('================================\n\n'));

    // Payment breakdown
    if (transaction.paymentBreakdown) {
      commands.push(new Uint8Array([0x1B, 0x61, 0x00])); // Left align
      commands.push(encoder.encode('PAYMENT BREAKDOWN:\n'));
      if (transaction.paymentBreakdown.pos > 0) {
        commands.push(encoder.encode(`POS: N${transaction.paymentBreakdown.pos.toLocaleString()}\n`));
      }
      if (transaction.paymentBreakdown.transfer > 0) {
        commands.push(encoder.encode(`Transfer: N${transaction.paymentBreakdown.transfer.toLocaleString()}\n`));
      }
      if (transaction.paymentBreakdown.cashInHand > 0) {
        commands.push(encoder.encode(`Cash: N${transaction.paymentBreakdown.cashInHand.toLocaleString()}\n`));
      }
      if (transaction.paymentBreakdown.salesOnReturn > 0) {
        commands.push(encoder.encode(`Sales on Return: N${transaction.paymentBreakdown.salesOnReturn.toLocaleString()}\n`));
      }
      commands.push(encoder.encode('\n'));
    }

    // Footer
    commands.push(new Uint8Array([0x1B, 0x61, 0x01])); // Center align
    commands.push(encoder.encode('Thank you for your business!\n'));
    commands.push(encoder.encode(`Status: ${transaction.status}\n\n`));

    // Cut paper
    commands.push(new Uint8Array([0x1D, 0x56, 0x00])); // GS V 0

    // Feed paper
    commands.push(encoder.encode('\n\n\n'));

    return commands;
  }

  // Disconnect from printer
  async disconnect(): Promise<void> {
    const port = this.port; // cache for TS narrowing
    if (port) {
      await port.close();
      this.port = null;
    }
  }
}

// Alternative: Browser print with custom formatting
export class BrowserPrinter {
  static async printReceipt(transaction: Transaction): Promise<boolean> {
    try {
      // Method 1: Try opening a new window for printing
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      
      if (!printWindow) {
        console.warn('Popup blocked, trying fallback method');
        return this.printReceiptFallback(transaction);
      }

      const calculatedTotal = transaction.paymentBreakdown 
        ? Object.values(transaction.paymentBreakdown).reduce((sum, amount) => sum + amount, 0)
        : transaction.total;

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            @media print {
              @page { 
                size: 80mm auto; 
                margin: 0; 
              }
              body { 
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 5mm;
                color: black;
              }
              .no-print { display: none; }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              width: 80mm;
              margin: 10px auto;
              padding: 10px;
            }
            .center { text-align: center; }
            .large { font-size: 16px; font-weight: bold; }
            .separator { 
              border-top: 1px dashed black; 
              margin: 10px 0; 
              width: 100%;
            }
            .total { font-size: 14px; font-weight: bold; }
            .print-button {
              position: fixed;
              top: 10px;
              right: 10px;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              z-index: 1000;
            }
            .print-button:hover {
              background: #0056b3;
            }
            @media print {
              .print-button { display: none; }
            }
          </style>
          <script>
            function printAndClose() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
            
            window.onload = function() {
              // Auto-focus for better UX
              window.focus();
              
              // Auto-print after a short delay
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </head>
        <body>
          <button class="print-button no-print" onclick="printAndClose()">🖨️ Print & Close</button>
          
          <div class="center">
            <div class="large">GREAT NABUKO COMPANY</div>
            <div>NIG. LTD.</div>
            <div>(REGISTERED IN NIGERIA)</div>
            <br>
            <div>Tel: 08188294545, 08037075421</div>
            <div>23 Bassey Duke street, calabar</div>
          </div>
          
          <div class="separator"></div>
          <div class="center large">SALES RECEIPT</div>
          <div class="separator"></div>
          
          <div>ID: ${transaction.id}</div>
          <div>Date: ${transaction.createdAt.toLocaleDateString()}</div>
          <div>Customer: ${transaction.customer}</div>
          ${transaction.customerAddress ? `<div>Address: ${transaction.customerAddress}</div>` : ''}
          ${transaction.customerPhone ? `<div>Phone: ${transaction.customerPhone}</div>` : ''}
          
          <div class="separator"></div>
          <div><strong>ITEMS:</strong></div>
          ${transaction.items.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            return `
              <div style="margin: 5px 0;">
                <div>${index + 1}. ${item.name}</div>
                ${item.make || item.model ? `<div style="margin-left: 10px;">${[item.make, item.model].filter(Boolean).join(' ')}</div>` : ''}
                ${item.type ? `<div style="margin-left: 10px;">Type: ${item.type}</div>` : ''}
                ${item.capacity ? `<div style="margin-left: 10px;">Capacity: ${item.capacity}</div>` : ''}
                ${item.description ? `<div style="margin-left: 10px; font-style: italic;">${item.description}</div>` : ''}
                <div style="margin-left: 10px;">${item.quantity} x ₦${item.price.toLocaleString()} = ₦${itemTotal.toLocaleString()}</div>
              </div>
            `;
          }).join('')}
          
          <div class="separator"></div>
          <div class="center total">TOTAL: ₦${calculatedTotal.toLocaleString()}</div>
          <div class="separator"></div>
          
          ${transaction.paymentBreakdown ? `
            <div><strong>PAYMENT BREAKDOWN:</strong></div>
            ${transaction.paymentBreakdown.pos > 0 ? `<div>POS: ₦${transaction.paymentBreakdown.pos.toLocaleString()}</div>` : ''}
            ${transaction.paymentBreakdown.transfer > 0 ? `<div>Transfer: ₦${transaction.paymentBreakdown.transfer.toLocaleString()}</div>` : ''}
            ${transaction.paymentBreakdown.cashInHand > 0 ? `<div>Cash: ₦${transaction.paymentBreakdown.cashInHand.toLocaleString()}</div>` : ''}
            ${transaction.paymentBreakdown.salesOnReturn > 0 ? `<div>Sales on Return: ₦${transaction.paymentBreakdown.salesOnReturn.toLocaleString()}</div>` : ''}
            <br>
          ` : ''}
          
          <div class="center">
            <div>Thank you for your business!</div>
            <div>Status: ${transaction.status}</div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      return true;
      
    } catch (error) {
      console.error('Browser print failed:', error);
      return this.printReceiptFallback(transaction);
    }
  }

  // Fallback method: Create a temporary div and print current page
  static printReceiptFallback(transaction: Transaction): boolean {
    try {
      const calculatedTotal = transaction.paymentBreakdown 
        ? Object.values(transaction.paymentBreakdown).reduce((sum, amount) => sum + amount, 0)
        : transaction.total;

      // Create a hidden div with the receipt
      const printDiv = document.createElement('div');
      printDiv.id = 'receipt-print-area';
      printDiv.style.position = 'fixed';
      printDiv.style.left = '-9999px';
      printDiv.innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; width: 300px;">
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: bold;">GREAT NABUKO COMPANY</div>
            <div>NIG. LTD.</div>
            <div>(REGISTERED IN NIGERIA)</div>
            <br>
            <div>Tel: 08188294545, 08037075421</div>
            <div>23 Bassey Duke street, calabar</div>
          </div>
          
          <hr style="border-top: 1px dashed black;">
          <div style="text-align: center; font-weight: bold;">SALES RECEIPT</div>
          <hr style="border-top: 1px dashed black;">
          
          <div>ID: ${transaction.id}</div>
          <div>Date: ${transaction.createdAt.toLocaleDateString()}</div>
          <div>Customer: ${transaction.customer}</div>
          ${transaction.customerAddress ? `<div>Address: ${transaction.customerAddress}</div>` : ''}
          ${transaction.customerPhone ? `<div>Phone: ${transaction.customerPhone}</div>` : ''}
          
          <hr style="border-top: 1px dashed black;">
          <div><strong>ITEMS:</strong></div>
          ${transaction.items.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            return `
              <div style="margin: 5px 0;">
                <div>${index + 1}. ${item.name}</div>
                ${item.make || item.model ? `<div style="margin-left: 10px;">${[item.make, item.model].filter(Boolean).join(' ')}</div>` : ''}
                ${item.type ? `<div style="margin-left: 10px;">Type: ${item.type}</div>` : ''}
                ${item.capacity ? `<div style="margin-left: 10px;">Capacity: ${item.capacity}</div>` : ''}
                ${item.description ? `<div style="margin-left: 10px; font-style: italic;">${item.description}</div>` : ''}
                <div style="margin-left: 10px;">${item.quantity} x ₦${item.price.toLocaleString()} = ₦${itemTotal.toLocaleString()}</div>
              </div>
            `;
          }).join('')}
          
          <hr style="border-top: 1px dashed black;">
          <div style="text-align: center; font-weight: bold;">TOTAL: ₦${calculatedTotal.toLocaleString()}</div>
          <hr style="border-top: 1px dashed black;">
          
          ${transaction.paymentBreakdown ? `
            <div><strong>PAYMENT BREAKDOWN:</strong></div>
            ${transaction.paymentBreakdown.pos > 0 ? `<div>POS: ₦${transaction.paymentBreakdown.pos.toLocaleString()}</div>` : ''}
            ${transaction.paymentBreakdown.transfer > 0 ? `<div>Transfer: ₦${transaction.paymentBreakdown.transfer.toLocaleString()}</div>` : ''}
            ${transaction.paymentBreakdown.cashInHand > 0 ? `<div>Cash: ₦${transaction.paymentBreakdown.cashInHand.toLocaleString()}</div>` : ''}
            ${transaction.paymentBreakdown.salesOnReturn > 0 ? `<div>Sales on Return: ₦${transaction.paymentBreakdown.salesOnReturn.toLocaleString()}</div>` : ''}
            <br>
          ` : ''}
          
          <div style="text-align: center;">
            <div>Thank you for your business!</div>
            <div>Status: ${transaction.status}</div>
          </div>
        </div>
      `;

      document.body.appendChild(printDiv);

      // Create print styles
      const printStyles = document.createElement('style');
      printStyles.id = 'receipt-print-styles';
      printStyles.innerHTML = `
        @media print {
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area { 
            position: static !important; 
            left: auto !important;
            width: 100% !important;
          }
        }
      `;
      document.head.appendChild(printStyles);

      // Trigger print
      window.print();

      // Cleanup after a delay
      setTimeout(() => {
        document.body.removeChild(printDiv);
        document.head.removeChild(printStyles);
      }, 1000);

      return true;
    } catch (error) {
      console.error('Fallback print failed:', error);
      alert('Print failed. Please try again or use a different browser.');
      return false;
    }
  }
}