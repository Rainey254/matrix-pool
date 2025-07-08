
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { playMT5NotificationSound } from '@/utils/soundUtils';

interface MpesaDepositHandlerProps {
  onBalanceUpdate: (newBalance: number) => void;
  currentBalance: number;
}

interface PendingDeposit {
  amount: number;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
}

export const useMpesaDepositHandler = ({ onBalanceUpdate, currentBalance }: MpesaDepositHandlerProps) => {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);

  const handleMpesaDeposit = (amount: number) => {
    const timestamp = Date.now();
    
    // Show initial confirmation
    toast({
      title: "M-Pesa Payment Received",
      description: `Processing deposit of $${amount}. Your balance will be updated in 3 minutes.`,
      duration: 5000,
    });

    // Set up 3-minute delay
    const timeoutId = setTimeout(() => {
      // Play MT5 notification sound
      playMT5NotificationSound();
      
      // Update balance
      const newBalance = currentBalance + amount;
      onBalanceUpdate(newBalance);
      
      // Show success notification
      toast({
        title: "Deposit Successful! 🎉",
        description: `$${amount} has been added to your account. New balance: $${newBalance.toLocaleString()}`,
        duration: 8000,
      });
      
      // Remove from pending deposits
      setPendingDeposits(prev => prev.filter(deposit => deposit.timestamp !== timestamp));
    }, 3 * 60 * 1000); // 3 minutes

    // Add to pending deposits
    const newDeposit: PendingDeposit = {
      amount,
      timestamp,
      timeoutId
    };
    
    setPendingDeposits(prev => [...prev, newDeposit]);
  };

  // Cleanup function to clear timeouts on unmount
  useEffect(() => {
    return () => {
      pendingDeposits.forEach(deposit => {
        clearTimeout(deposit.timeoutId);
      });
    };
  }, [pendingDeposits]);

  return {
    handleMpesaDeposit,
    pendingDeposits: pendingDeposits.map(d => ({ amount: d.amount, timestamp: d.timestamp }))
  };
};
