import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TradingPair } from "@/hooks/useMarketData";

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  selectedPair: TradingPair | null;
}

export const OrderBook = ({ selectedPair }: OrderBookProps) => {
  const [buyOrders, setBuyOrders] = useState<OrderBookEntry[]>([]);
  const [sellOrders, setSellOrders] = useState<OrderBookEntry[]>([]);

  useEffect(() => {
    if (!selectedPair) return;

    // Generate mock order book data
    const generateOrders = (basePrice: number, isBuy: boolean) => {
      const orders: OrderBookEntry[] = [];
      let total = 0;
      
      for (let i = 0; i < 10; i++) {
        const priceVariation = isBuy ? -i * 0.001 : i * 0.001;
        const price = basePrice * (1 + priceVariation);
        const quantity = Math.random() * 100 + 10;
        total += quantity;
        
        orders.push({
          price: parseFloat(price.toFixed(4)),
          quantity: parseFloat(quantity.toFixed(4)),
          total: parseFloat(total.toFixed(4))
        });
      }
      
      return orders;
    };

    setBuyOrders(generateOrders(selectedPair.price, true));
    setSellOrders(generateOrders(selectedPair.price, false));

    // Update order book every 3 seconds
    const interval = setInterval(() => {
      setBuyOrders(generateOrders(selectedPair.price, true));
      setSellOrders(generateOrders(selectedPair.price, false));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedPair]);

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(6) : price.toFixed(4);
  };

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(4);
  };

  if (!selectedPair) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            Select a trading pair to view the order book
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Order Book</CardTitle>
          <Badge variant="outline" className="text-gray-400">
            {selectedPair.symbol}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-4 py-2 border-b border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 font-medium">
            <div>Price ({selectedPair.quote_asset})</div>
            <div className="text-right">Quantity ({selectedPair.base_asset})</div>
            <div className="text-right">Total</div>
          </div>
        </div>
        
        {/* Sell Orders */}
        <div className="max-h-48 overflow-y-auto">
          {sellOrders.reverse().map((order, index) => (
            <div 
              key={`sell-${index}`}
              className="px-4 py-1 hover:bg-slate-700/50 transition-colors relative"
            >
              <div 
                className="absolute inset-0 bg-red-500/10"
                style={{ 
                  width: `${(order.total / Math.max(...sellOrders.map(o => o.total))) * 100}%`,
                  right: 0
                }}
              />
              <div className="grid grid-cols-3 gap-4 text-xs relative z-10">
                <div className="text-red-400 font-mono">{formatPrice(order.price)}</div>
                <div className="text-white text-right font-mono">{formatQuantity(order.quantity)}</div>
                <div className="text-gray-400 text-right font-mono">{formatQuantity(order.total)}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Current Price */}
        <div className="px-4 py-3 bg-slate-700/50 border-y border-slate-600">
          <div className="text-center">
            <div className="text-white font-bold text-lg font-mono">
              ${formatPrice(selectedPair.price)}
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs mt-1 ${
                selectedPair.price_change_24h >= 0 
                  ? 'text-green-400 border-green-400' 
                  : 'text-red-400 border-red-400'
              }`}
            >
              {selectedPair.price_change_24h >= 0 ? '+' : ''}{selectedPair.price_change_24h.toFixed(2)}%
            </Badge>
          </div>
        </div>
        
        {/* Buy Orders */}
        <div className="max-h-48 overflow-y-auto">
          {buyOrders.map((order, index) => (
            <div 
              key={`buy-${index}`}
              className="px-4 py-1 hover:bg-slate-700/50 transition-colors relative"
            >
              <div 
                className="absolute inset-0 bg-green-500/10"
                style={{ 
                  width: `${(order.total / Math.max(...buyOrders.map(o => o.total))) * 100}%`,
                  right: 0
                }}
              />
              <div className="grid grid-cols-3 gap-4 text-xs relative z-10">
                <div className="text-green-400 font-mono">{formatPrice(order.price)}</div>
                <div className="text-white text-right font-mono">{formatQuantity(order.quantity)}</div>
                <div className="text-gray-400 text-right font-mono">{formatQuantity(order.total)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};