// utils/transactionUtils.ts

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Transaction {
  id: string;
  items: CartItem[];
  customer: string;
  paymentMethod: string;
  total: number;
  createdAt: Date;
  status: 'Successful' | 'Ongoing' | 'Failed';
}

export const generateTransactionId = (): string => {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8); // Last 8 digits of timestamp
  return `A-${timestamp}`;
};

export const createTransaction = (
  cartItems: CartItem[],
  customerName: string,
  paymentMethod: string
): Transaction => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    id: generateTransactionId(),
    items: [...cartItems], // Create a copy of cart items
    customer: customerName,
    paymentMethod: paymentMethod,
    total: total,
    createdAt: new Date(),
    status: 'Successful' // All transactions are successful as per requirements
  };
};

export const saveTransaction = (transaction: Transaction): void => {
  try {
    // Get existing transactions
    const existingTransactions = getTransactions();
    
    // Add new transaction at the beginning (most recent first)
    const updatedTransactions = [transaction, ...existingTransactions];
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    console.log('Transaction saved successfully:', transaction.id);
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

export const getTransactions = (): Transaction[] => {
  try {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      // Convert date strings back to Date objects
      return parsed.map((transaction: any) => ({
        ...transaction,
        createdAt: new Date(transaction.createdAt)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const deleteTransaction = (transactionId: string): void => {
  try {
    const existingTransactions = getTransactions();
    const updatedTransactions = existingTransactions.filter(
      transaction => transaction.id !== transactionId
    );
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    console.log('Transaction deleted successfully:', transactionId);
  } catch (error) {
    console.error('Error deleting transaction:', error);
  }
};

export const clearAllTransactions = (): void => {
  try {
    localStorage.removeItem('transactions');
    console.log('All transactions cleared');
  } catch (error) {
    console.error('Error clearing transactions:', error);
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

// Helper function to format date
export const formatTransactionDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get transaction summary
export const getTransactionSummary = (transactions: Transaction[]) => {
  const total = transactions.length;
  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const successful = transactions.filter(t => t.status === 'Successful').length;
  const failed = transactions.filter(t => t.status === 'Failed').length;
  const ongoing = transactions.filter(t => t.status === 'Ongoing').length;

  return {
    total,
    totalRevenue,
    successful,
    failed,
    ongoing,
    successRate: total > 0 ? (successful / total) * 100 : 0
  };
};