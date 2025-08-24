import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { ChartLine, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { useMarketData } from "@/hooks/useMarketData";
import { TradingModeToggle } from "./TradingModeToggle";
import { TradingPairsList } from "./TradingPairsList";
import { TradingChart } from "./TradingChart";
import { OrderBook } from "./OrderBook";
import { SpotTrading } from "./SpotTrading";
import { FuturesTrading } from "./FuturesTrading";
import { supabase } from '@/integrations/supabase/client';

export const NewTradingDashboard = () => {
  const [tradingMode, setTradingMode] = useState<'spot' | 'futures'>('spot');
  const [demoBalance, setDemoBalance] = useState(10000);
  const [spotBalance, setSpotBalance] = useState(5000);
  const [futuresBalance, setFuturesBalance] = useState(3000);
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo');
  const [userAccountId, setUserAccountId] = useState<string>('');
  const { tradingPairs, marketData, isLoading } = useMarketData();
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0] || null);

  useEffect(() => {
    if (tradingPairs.length > 0 && !selectedPair) {
      setSelectedPair(tradingPairs[0]);
    }
  }, [tradingPairs, selectedPair]);

  // Initialize user accounts
  useEffect(() => {
    const initializeAccounts = async () => {
      const userEmail = authService.getCurrentUserEmail();
      if (!userEmail) return;

      // Create a session ID as user identifier
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUserAccountId(sessionId);

      try {
        // Create demo account
        await supabase
          .from('trading_accounts')
          .insert({
            user_id: sessionId,
            account_type: 'demo',
            balance: demoBalance,
            available_balance: demoBalance
          });

        // Create spot account  
        await supabase
          .from('trading_accounts')
          .insert({
            user_id: sessionId,
            account_type: 'spot',
            balance: spotBalance,
            available_balance: spotBalance
          });

        // Create futures account
        await supabase
          .from('trading_accounts')
          .insert({
            user_id: sessionId,
            account_type: 'futures',
            balance: futuresBalance,
            available_balance: futuresBalance,
            margin_balance: 0
          });
      } catch (error) {
        console.error('Error creating accounts:', error);
      }
    };

    initializeAccounts();
  }, []);

  const handleLogout = () => {
    authService.logoutUser();
    window.location.reload();
  };

  const getCurrentBalance = () => {
    if (accountType === 'demo') return demoBalance;
    return tradingMode === 'spot' ? spotBalance : futuresBalance;
  };

  const handleBalanceChange = (newBalance: number) => {
    if (accountType === 'demo') {
      setDemoBalance(newBalance);
    } else if (tradingMode === 'spot') {
      setSpotBalance(newBalance);
    } else {
      setFuturesBalance(newBalance);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChartLine className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">Matrix-pool</span>
              </div>
              
              <Badge variant="outline" className="text-green-400 border-green-400">
                {accountType === 'demo' ? 'Demo Account' : 'Real Account'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-white font-bold">${getCurrentBalance().toLocaleString()}</div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAccountType(accountType === 'demo' ? 'real' : 'demo')}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                Switch to {accountType === 'demo' ? 'Real' : 'Demo'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <TradingModeToggle mode={tradingMode} onModeChange={setTradingMode} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Trading Pairs List */}
          <div className="col-span-3">
            <TradingPairsList
              pairs={tradingPairs}
              selectedPair={selectedPair}
              onPairSelect={setSelectedPair}
              tradingMode={tradingMode}
            />
          </div>
          
          {/* Chart */}
          <div className="col-span-6">
            <TradingChart 
              selectedPair={selectedPair}
              marketData={marketData}
            />
          </div>
          
          {/* Order Book */}
          <div className="col-span-3">
            <OrderBook selectedPair={selectedPair} />
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Trading Interface */}
          <div className="col-span-6">
            {tradingMode === 'spot' ? (
              <SpotTrading
                selectedPair={selectedPair}
                balance={getCurrentBalance()}
                onBalanceChange={handleBalanceChange}
                accountId={userAccountId}
              />
            ) : (
              <FuturesTrading
                selectedPair={selectedPair}
                balance={getCurrentBalance()}
                onBalanceChange={handleBalanceChange}
                accountId={userAccountId}
              />
            )}
          </div>
          
          {/* Portfolio/Positions Summary */}
          <div className="col-span-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">
                {tradingMode === 'spot' ? 'Portfolio' : 'Open Positions'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <span className="text-gray-300">Available Balance:</span>
                  <span className="text-white font-medium">${getCurrentBalance().toLocaleString()}</span>
                </div>
                
                {tradingMode === 'futures' && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <span className="text-gray-300">Margin Used:</span>
                      <span className="text-white font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <span className="text-gray-300">Unrealized PnL:</span>
                      <span className="text-green-400 font-medium">+$0.00</span>
                    </div>
                  </>
                )}
                
                <div className="text-center text-gray-400 py-4">
                  {tradingMode === 'spot' 
                    ? 'No holdings yet. Start trading to build your portfolio.'
                    : 'No open positions. Open a position to start trading futures.'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};