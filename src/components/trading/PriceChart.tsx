import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CandlestickChart from "./CandlestickChart";

interface PriceChartProps {
  selectedInstrument: string;
  onInstrumentChange: (instrument: string) => void;
}

const tradingInstruments = [
  { id: "volatility_75", name: "Volatility 75 Index", basePrice: 1000, volatility: 10 },
  { id: "volatility_25", name: "Volatility 25 Index", basePrice: 800, volatility: 6 },
  { id: "boom_1000", name: "Boom 1000 Index", basePrice: 1200, volatility: 15 },
  { id: "crash_500", name: "Crash 500 Index", basePrice: 600, volatility: 12 },
  { id: "step_index", name: "Step Index", basePrice: 900, volatility: 8 },
  { id: "forex_eurusd", name: "EUR/USD", basePrice: 1.0850, volatility: 0.002 },
  { id: "forex_gbpusd", name: "GBP/USD", basePrice: 1.2650, volatility: 0.003 },
  { id: "forex_usdjpy", name: "USD/JPY", basePrice: 148.50, volatility: 0.5 },
  { id: "crypto_btc", name: "Bitcoin Index", basePrice: 45000, volatility: 800 },
  { id: "crypto_eth", name: "Ethereum Index", basePrice: 2800, volatility: 60 },
  { id: "gold", name: "Gold", basePrice: 2050, volatility: 15 },
  { id: "oil", name: "Oil", basePrice: 75, volatility: 2 }
];

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  candleHeight: number;
  candleY: number;
  wickHeight: number;
  wickY: number;
  color: string;
}

const PriceChart = ({ selectedInstrument, onInstrumentChange }: PriceChartProps) => {
  const [priceData, setPriceData] = useState<Array<{time: string, price: number}>>([]);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1000);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  const currentInstrument = tradingInstruments.find(inst => inst.id === selectedInstrument) || tradingInstruments[0];

  const generateCandleData = (priceHistory: number[]) => {
    const candles: CandleData[] = [];
    
    for (let i = 0; i < priceHistory.length; i += 5) {
      const periodPrices = priceHistory.slice(i, i + 5);
      if (periodPrices.length < 5) break;
      
      const open = periodPrices[0];
      const close = periodPrices[4];
      const high = Math.max(...periodPrices);
      const low = Math.min(...periodPrices);
      
      const isGreen = close > open;
      const candleHeight = Math.abs(close - open);
      const candleY = Math.max(open, close);
      const wickHeight = high - low;
      const wickY = high;
      
      candles.push({
        time: new Date(Date.now() - (priceHistory.length - i) * 5000).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        open,
        high,
        low,
        close,
        candleHeight,
        candleY,
        wickHeight,
        wickY,
        color: isGreen ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
      });
    }
    
    return candles.slice(-20); // Show last 20 candles
  };

  useEffect(() => {
    // Initialize with some sample data for the selected instrument
    const initialData = [];
    const priceHistory = [];
    let price = currentInstrument.basePrice;
    
    for (let i = 0; i < 100; i++) {
      // Add more realistic market manipulation - higher chance of losses
      const marketBias = Math.random() < 0.6 ? -1 : 1; // 60% chance of negative movement
      const change = (Math.random() - 0.3) * currentInstrument.volatility * marketBias; // Biased towards losses
      price += change;
      
      // Keep price within reasonable bounds
      const minPrice = currentInstrument.basePrice * 0.9;
      const maxPrice = currentInstrument.basePrice * 1.1;
      price = Math.max(minPrice, Math.min(maxPrice, price));
      
      const formattedPrice = parseFloat(price.toFixed(currentInstrument.id.includes('forex') ? 4 : 2));
      priceHistory.push(formattedPrice);
      
      if (i >= 50) {
        initialData.push({
          time: new Date(Date.now() - (99 - i) * 1000).toLocaleTimeString(),
          price: formattedPrice
        });
      }
    }
    
    setPriceData(initialData);
    setCandleData(generateCandleData(priceHistory));
    setCurrentPrice(price);
  }, [selectedInstrument, currentInstrument.basePrice, currentInstrument.volatility]);

  useEffect(() => {
    // Simulate real-time price updates with market manipulation
    const interval = setInterval(() => {
      let latestPriceData: any[] = [];
      
      setCurrentPrice(prev => {
        // Increase probability of downward movement to create more losses
        const marketBias = Math.random() < 0.65 ? -1 : 1; // 65% chance of negative movement
        const change = (Math.random() - 0.4) * currentInstrument.volatility * marketBias; // More bearish bias
        
        const newPrice = prev + change;
        const minPrice = currentInstrument.basePrice * 0.85;
        const maxPrice = currentInstrument.basePrice * 1.15;
        const boundedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
        
        const finalPrice = parseFloat(boundedPrice.toFixed(currentInstrument.id.includes('forex') ? 4 : 2));
        
        // Determine price direction for visual feedback
        if (finalPrice > prev) setPriceDirection('up');
        else if (finalPrice < prev) setPriceDirection('down');
        else setPriceDirection('neutral');
        
        setPriceData(prevData => {
          const newData = [...prevData.slice(1), {
            time: new Date().toLocaleTimeString(),
            price: finalPrice
          }];
          latestPriceData = newData;
          return newData;
        });
        
        // Update candle data every 5 seconds
        setCandleData(prevCandles => {
          const now = new Date();
          if (now.getSeconds() % 5 === 0 && latestPriceData.length >= 5) {
            // Generate new candle from recent price data
            const recentPrices = [...latestPriceData.slice(-5).map(d => d.price), finalPrice];
            const open = recentPrices[0];
            const close = finalPrice;
            const high = Math.max(...recentPrices);
            const low = Math.min(...recentPrices);
            
            const isGreen = close > open;
            const newCandle: CandleData = {
              time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              open,
              high,
              low,
              close,
              candleHeight: Math.abs(close - open),
              candleY: Math.max(open, close),
              wickHeight: high - low,
              wickY: high,
              color: isGreen ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
            };
            
            return [...prevCandles.slice(1), newCandle];
          }
          return prevCandles;
        });
        
        return finalPrice;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentInstrument.volatility, currentInstrument.basePrice]);

  const formatPrice = (price: number) => {
    if (currentInstrument.id.includes('forex')) {
      return price.toFixed(4);
    } else if (currentInstrument.id === 'crypto_btc') {
      return price.toFixed(0);
    }
    return price.toFixed(2);
  };

  const getPriceChangeColor = () => {
    switch (priceDirection) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Instrument Selector */}
      <div className="flex justify-between items-center">
        <Select value={selectedInstrument} onValueChange={onInstrumentChange}>
          <SelectTrigger className="w-64 bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
            {tradingInstruments.map((instrument) => (
              <SelectItem key={instrument.id} value={instrument.id} className="text-white">
                {instrument.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Price */}
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold transition-colors ${getPriceChangeColor()}`}>
            {formatPrice(currentPrice)}
          </div>
          <div className="text-sm text-gray-400">{currentInstrument.name}</div>
        </div>
        <div className="text-right">
          <div className={`text-sm ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
            {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 2).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-400">24h Change</div>
        </div>
      </div>

      {/* Price Line Chart */}
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              width={60}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Candlestick Chart */}
      <div className="h-32 sm:h-40">
        <div className="text-sm font-medium text-muted-foreground mb-2">Candlestick Chart</div>
        <CandlestickChart data={candleData} />
      </div>
    </div>
  );
};

export default PriceChart;
