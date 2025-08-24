import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  accountType: 'demo' | 'real';
  method?: string;
  userId?: string;
}

export const useRealtimeTransactions = (accountType: 'demo' | 'real', userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time connection
    setIsConnected(true);

    // Generate realistic transaction data
    const generateTransaction = (): Transaction => {
      const types: Transaction['type'][] = ['deposit', 'withdraw', 'trade'];
      const statuses: Transaction['status'][] = ['pending', 'completed', 'failed'];
      const methods = ['M-Pesa', 'Bitcoin', 'Ethereum', 'Bank Transfer'];
      
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        amount: Math.floor(Math.random() * 1000) + 10,
        status,
        timestamp: new Date().toISOString(),
        accountType,
        method: type !== 'trade' ? methods[Math.floor(Math.random() * methods.length)] : undefined,
        userId
      };
    };

    // Initial transactions
    const initialTransactions = Array.from({ length: 5 }, generateTransaction);
    setTransactions(initialTransactions);

    // Simulate real-time updates every 10-30 seconds
    const interval = setInterval(() => {
      const newTransaction = generateTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 19)]); // Keep latest 20
    }, Math.random() * 20000 + 10000); // Random interval 10-30 seconds

    // Simulate status updates for pending transactions
    const statusUpdateInterval = setInterval(() => {
      setTransactions(prev => 
        prev.map(transaction => {
          if (transaction.status === 'pending' && Math.random() > 0.7) {
            return {
              ...transaction,
              status: Math.random() > 0.1 ? 'completed' : 'failed' as Transaction['status']
            };
          }
          return transaction;
        })
      );
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(statusUpdateInterval);
      setIsConnected(false);
    };
  }, [accountType, userId]);

  return {
    transactions,
    isConnected,
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };
};