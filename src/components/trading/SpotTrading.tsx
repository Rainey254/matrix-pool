import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TradingPair } from "@/hooks/useMarketData";
import { supabase } from '@/integrations/supabase/client';

interface SpotTradingProps {
  selectedPair: TradingPair | null;
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  accountId: string;
}

export const SpotTrading = ({ selectedPair, balance, onBalanceChange, accountId }: SpotTradingProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!selectedPair || !quantity) {
      toast({
        title: "Invalid Order",
        description: "Please select a trading pair and enter quantity",
        variant: "destructive"
      });
      return;
    }

    const orderPrice = orderType === 'market' ? selectedPair.price : parseFloat(price);
    const orderQuantity = parseFloat(quantity);
    const totalCost = orderPrice * orderQuantity;

    if (side === 'buy' && totalCost > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance to place this order",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: accountId,
          account_id: accountId,
          trading_pair_id: selectedPair.id,
          order_type: orderType,
          side,
          quantity: orderQuantity,
          price: orderType === 'limit' ? orderPrice : null,
          status: orderType === 'market' ? 'filled' : 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate order execution for market orders
      if (orderType === 'market') {
        // Update balance
        const newBalance = side === 'buy' 
          ? balance - totalCost 
          : balance + totalCost;
        
        onBalanceChange(newBalance);

        // Update order status
        await supabase
          .from('orders')
          .update({ 
            status: 'filled',
            filled_quantity: orderQuantity,
            price: orderPrice
          })
          .eq('id', order.id);

        toast({
          title: "Order Executed",
          description: `${side.toUpperCase()} order for ${orderQuantity} ${selectedPair.base_asset} executed at $${orderPrice.toFixed(4)}`,
        });
      } else {
        toast({
          title: "Order Placed",
          description: `Limit ${side} order placed for ${orderQuantity} ${selectedPair.base_asset} at $${orderPrice.toFixed(4)}`,
        });
      }

      setQuantity('');
      setPrice('');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const maxQuantity = selectedPair ? balance / selectedPair.price : 0;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spot Trading
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
            variant={side === 'buy' ? 'default' : 'outline'}
            onClick={() => setSide('buy')}
            className={side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            onClick={() => setSide('sell')}
            className={side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Sell
          </Button>
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
          {side === 'buy' && selectedPair && (
            <div className="text-xs text-gray-400 mt-1">
              Max: {maxQuantity.toFixed(6)} {selectedPair.base_asset}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map(percentage => (
            <Button
              key={percentage}
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedPair) {
                  const qty = (maxQuantity * percentage / 100).toFixed(6);
                  setQuantity(qty);
                }
              }}
              className="text-xs"
            >
              {percentage}%
            </Button>
          ))}
        </div>

        <div className="p-3 bg-slate-700 rounded-lg text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Available Balance:</span>
            <span className="text-white">${balance.toLocaleString()}</span>
          </div>
          {selectedPair && quantity && (
            <div className="flex justify-between text-gray-300 mt-2">
              <span>Total Cost:</span>
              <span className="text-white">
                ${((parseFloat(quantity) || 0) * selectedPair.price).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedPair || !quantity}
          className={`w-full ${
            side === 'buy' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isProcessing ? 'Processing...' : `${side.toUpperCase()} ${selectedPair?.base_asset || 'Asset'}`}
        </Button>
      </CardContent>
    </Card>
  );
};