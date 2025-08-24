import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Zap, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TradingPair } from "@/hooks/useMarketData";
import { supabase } from '@/integrations/supabase/client';

interface FuturesTradingProps {
  selectedPair: TradingPair | null;
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  accountId: string;
}

export const FuturesTrading = ({ selectedPair, balance, onBalanceChange, accountId }: FuturesTradingProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState([10]);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentLeverage = leverage[0];
  const marginRequired = selectedPair && quantity 
    ? (parseFloat(quantity) * selectedPair.price) / currentLeverage 
    : 0;

  const handleOpenPosition = async () => {
    if (!selectedPair || !quantity) {
      toast({
        title: "Invalid Order",
        description: "Please select a trading pair and enter quantity",
        variant: "destructive"
      });
      return;
    }

    if (marginRequired > balance) {
      toast({
        title: "Insufficient Margin",
        description: "Not enough balance for required margin",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const entryPrice = orderType === 'market' ? selectedPair.price : parseFloat(price);
      
      // Create position in database
      const { data: position, error } = await supabase
        .from('positions')
        .insert({
          user_id: accountId,
          account_id: accountId,
          trading_pair_id: selectedPair.id,
          side,
          quantity: parseFloat(quantity),
          entry_price: entryPrice,
          current_price: entryPrice,
          leverage: currentLeverage,
          margin_used: marginRequired,
          stop_loss: stopLoss ? parseFloat(stopLoss) : null,
          take_profit: takeProfit ? parseFloat(takeProfit) : null
        })
        .select()
        .single();

      if (error) throw error;

      // Update balance (deduct margin)
      onBalanceChange(balance - marginRequired);

      toast({
        title: "Position Opened",
        description: `${side.toUpperCase()} position opened for ${quantity} ${selectedPair.base_asset} with ${currentLeverage}x leverage`,
      });

      setQuantity('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
    } catch (error) {
      console.error('Error opening position:', error);
      toast({
        title: "Position Failed",
        description: "Failed to open position. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const maxQuantity = selectedPair ? (balance * currentLeverage) / selectedPair.price : 0;
  const liquidationPrice = selectedPair && quantity 
    ? side === 'long' 
      ? selectedPair.price * (1 - 1/currentLeverage)
      : selectedPair.price * (1 + 1/currentLeverage)
    : 0;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Futures Trading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPair && (
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">{selectedPair.symbol}</span>
              <div className="text-right">
                <div className="text-white font-bold">${selectedPair.price.toFixed(4)}</div>
                <Badge 
                  variant="outline" 
                  className={selectedPair.price_change_24h >= 0 ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}
                >
                  {selectedPair.price_change_24h >= 0 ? '+' : ''}{selectedPair.price_change_24h.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'long' ? 'default' : 'outline'}
            onClick={() => setSide('long')}
            className={side === 'long' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Long
          </Button>
          <Button
            variant={side === 'short' ? 'default' : 'outline'}
            onClick={() => setSide('short')}
            className={side === 'short' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Short
          </Button>
        </div>

        <div>
          <Label className="text-gray-300">Leverage: {currentLeverage}x</Label>
          <Slider
            value={leverage}
            onValueChange={setLeverage}
            max={100}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>100x</span>
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Order Type</Label>
          <Select value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {orderType === 'limit' && (
          <div>
            <Label className="text-gray-300">Price (USDT)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        )}

        <div>
          <Label className="text-gray-300">
            Quantity ({selectedPair?.base_asset || 'Asset'})
          </Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="bg-slate-700 border-slate-600 text-white"
          />
          <div className="text-xs text-gray-400 mt-1">
            Max: {maxQuantity.toFixed(6)} {selectedPair?.base_asset || 'Asset'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-gray-300">Stop Loss</Label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Optional"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Take Profit</Label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Optional"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-700 rounded-lg text-sm space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Available Balance:</span>
            <span className="text-white">${balance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Margin Required:</span>
            <span className="text-white">${marginRequired.toFixed(2)}</span>
          </div>
          {liquidationPrice > 0 && (
            <div className="flex justify-between text-gray-300">
              <span>Liquidation Price:</span>
              <span className="text-red-400">${liquidationPrice.toFixed(4)}</span>
            </div>
          )}
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">High Risk Warning</span>
          </div>
          <p className="text-xs text-orange-300 mt-1">
            Futures trading with leverage involves high risk. You can lose more than your margin.
          </p>
        </div>

        <Button
          onClick={handleOpenPosition}
          disabled={isProcessing || !selectedPair || !quantity || marginRequired > balance}
          className={`w-full ${
            side === 'long' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isProcessing 
            ? 'Processing...' 
            : `Open ${side.toUpperCase()} Position (${currentLeverage}x)`
          }
        </Button>
      </CardContent>
    </Card>
  );
};