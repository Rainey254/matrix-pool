import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TradingPair, MarketDataPoint } from "@/hooks/useMarketData";

interface TradingChartProps {
  selectedPair: TradingPair | null;
  marketData: Record<string, MarketDataPoint[]>;
}

export const TradingChart = ({ selectedPair, marketData }: TradingChartProps) => {
  const [chartData, setChartData] = useState<Array<{ time: string; price: number; volume: number }>>([]);

  useEffect(() => {
    if (!selectedPair || !marketData[selectedPair.id]) {
      // Generate initial sample data if no market data
      if (selectedPair) {
        const initialData = [];
        let price = selectedPair.price;
        
        for (let i = 0; i < 50; i++) {
          const volatility = selectedPair.symbol.includes('BTC') ? 500 : 
                            selectedPair.symbol.includes('ETH') ? 50 : 
                            10;
          const change = (Math.random() - 0.5) * volatility * 0.01;
          price += change;
          
          initialData.push({
            time: new Date(Date.now() - (49 - i) * 60000).toLocaleTimeString(),
            price: parseFloat(price.toFixed(4)),
            volume: Math.random() * 1000
          });
        }
        setChartData(initialData);
      }
      return;
    }

    // Convert market data to chart format
    const data = marketData[selectedPair.id].slice(-50).map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      price: parseFloat(point.price.toString()),
      volume: parseFloat(point.volume.toString())
    }));
    
    setChartData(data);
  }, [selectedPair, marketData]);

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(6) : price.toFixed(2);
  };

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">
            {selectedPair ? selectedPair.symbol : 'Select a Trading Pair'}
          </CardTitle>
          <Badge className="bg-green-600 animate-pulse">
            <span className="animate-pulse">●</span> LIVE
          </Badge>
        </div>
        
        {selectedPair && (
          <div className="flex items-center gap-4">
            <div>
              <div className={`text-2xl font-bold ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${formatPrice(currentPrice)}
              </div>
              <div className={`text-sm ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">24h High</div>
              <div className="text-white">${formatPrice(selectedPair.price * 1.05)}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">24h Low</div>
              <div className="text-white">${formatPrice(selectedPair.price * 0.95)}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400">24h Volume</div>
              <div className="text-white">${selectedPair.volume_24h.toLocaleString()}</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {selectedPair ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 0.001', 'dataMax + 0.001']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => formatPrice(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number, name: string) => [
                    name === 'price' ? `$${formatPrice(value)}` : value.toFixed(2),
                    name === 'price' ? 'Price' : 'Volume'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">
            Select a trading pair to view the chart
          </div>
        )}
      </CardContent>
    </Card>
  );
};