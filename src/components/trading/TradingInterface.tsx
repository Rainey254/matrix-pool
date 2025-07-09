import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface TradingInterfaceProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  accountType: 'demo' | 'real';
  selectedInstrument: string;
  onTradeComplete: (mine: any) => void;
}

const TradingInterface = ({ balance, onBalanceChange, accountType, selectedInstrument, onTradeComplete }: TradingInterfaceProps) => {
  const [mineAmount, setMineAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(100);
  const [isMining, setIsMining] = useState(false);

  const setMineAmountValue = (amount: number) => {
    setMineAmount(amount);
  };

  const handleMine = async (direction: 'up' | 'down') => {
    if (mineAmount > balance) {
      toast({
        title: "Insufficient funds",
        description: "Mine amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    setIsMining(true);
    
    // Simulate mine execution with market manipulation for more losses
    setTimeout(() => {
      // Manipulated odds: 35% win rate instead of 50%
      const winProbability = 0.35;
      const isWin = Math.random() < winProbability;
      
      // Calculate payout/loss
      const payout = isWin ? mineAmount * (multiplier / 100) : -mineAmount;
      const newBalance = balance + payout;
      
      // Create mine record
      const mine = {
        id: Date.now().toString(),
        instrument: selectedInstrument,
        type: direction.toUpperCase(),
        amount: mineAmount,
        multiplier: multiplier,
        payout: payout,
        result: isWin ? 'win' : 'loss',
        timestamp: new Date().toLocaleString(),
        duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`
      };
      
      onBalanceChange(Math.max(0, newBalance));
      onTradeComplete(mine);
      
      toast({
        title: isWin ? "Mine Profit+ 🎉" : "Mine Lost 😞",
        description: `${isWin ? '+' : ''}$${payout.toFixed(2)}`,
        variant: isWin ? "default" : "destructive",
      });
      
      setIsMining(false);
    }, Math.random() * 3000 + 2000); // Random execution time between 2-5 seconds
  };

  const getInstrumentName = (instrument: string) => {
    const names: { [key: string]: string } = {
      'volatility_75': 'Volatility 75',
      'volatility_85': 'Volatility 85',
      'boom_1000': 'Boom 1000',
      'crash_500': 'Crash 500',
      'step_index': 'Step Index',
      'forex_eurusd': 'EUR/USD',
      'forex_gbpusd': 'GBP/USD',
      'forex_usdjpy': 'USD/JPY',
      'crypto_btc': 'Bitcoin',
      'crypto_eth': 'Ethereum',
      'gold': 'Gold',
      'oil': 'Oil'
    };
    return names[instrument] || 'Unknown';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Mine Panel
          <Badge className="bg-purple-600">
            {getInstrumentName(selectedInstrument)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mine Amount */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Mine Amount</label>
          <div className="flex items-center space-x-2">
            <span className="text-white">$</span>
            <Input
              type="number"
              value={mineAmount}
              onChange={(e) => setMineAmountValue(Number(e.target.value))}
              className="bg-slate-700 border-slate-600 text-white"
              min="1"
              max={balance}
            />
          </div>
          <div className="flex space-x-2">
            {[10, 25, 50, 100].map((amount) => (
              <Button
                key={amount}
                size="sm"
                onClick={() => setMineAmountValue(amount)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                disabled={amount > balance}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Multiplier */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Multiplier</label>
          <div className="flex items-center space-x-2">
            <span className="text-white">x</span>
            <Input
              type="number"
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              className="bg-slate-700 border-slate-600 text-white"
              min="50"
              max="1000"
              step="50"
            />
          </div>
          <div className="flex space-x-2">
            {[100, 250, 500, 1000].map((mult) => (
              <Button
                key={mult}
                size="sm"
                onClick={() => setMultiplier(mult)}
                className="bg-pink-600 hover:bg-pink-700 text-white border-0"
              >
                x{mult}
              </Button>
            ))}
          </div>
        </div>

        {/* Risk Warning */}
        <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
          <p className="text-red-400 text-sm">
            ⚠️ High Risk: Most mines result in losses. Mine responsibly.
          </p>
        </div>

        {/* Potential Payout */}
        <div className="p-4 bg-slate-700 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Potential Payout:</span>
            <span className="text-green-400 font-medium">
              ${(mineAmount * (multiplier / 100)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Win Rate (Historical):</span>
            <span className="text-red-400">~35%</span>
          </div>
        </div>

        {/* Mine Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleMine('up')}
            disabled={isMining || balance < mineAmount}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
          >
            {isMining ? 'Mining...' : 'HIGHER'}
          </Button>
          <Button
            onClick={() => handleMine('down')}
            disabled={isMining || balance < mineAmount}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-6"
          >
            {isMining ? 'Mining...' : 'LOWER'}
          </Button>
        </div>

        {balance < mineAmount && (
          <div className="text-center p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
            <p className="text-yellow-400 text-sm">Insufficient balance for this mine amount</p>
          </div>
        )}

        {accountType === 'demo' && (
          <div className="text-center">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Demo Mode - No Real Money Risk
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingInterface;
