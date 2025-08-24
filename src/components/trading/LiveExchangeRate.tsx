import { useState, useEffect } from 'react';

const LiveExchangeRate = () => {
  const [rate, setRate] = useState(134.0);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    const interval = setInterval(() => {
      setRate(prevRate => {
        // Simulate realistic fluctuations around 134 KES per USD
        const baseRate = 134.0;
        const volatility = 0.5; // KES volatility range
        const randomChange = (Math.random() - 0.5) * volatility;
        const newRate = baseRate + randomChange + (Math.random() - 0.5) * 0.2;
        
        // Keep rate within reasonable bounds (132-136)
        const boundedRate = Math.max(132.0, Math.min(136.0, newRate));
        const finalRate = parseFloat(boundedRate.toFixed(2));
        
        // Set trend
        if (finalRate > prevRate) setTrend('up');
        else if (finalRate < prevRate) setTrend('down');
        else setTrend('neutral');
        
        return finalRate;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="p-3 bg-slate-700 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Live Exchange Rate:</span>
        <div className={`flex items-center gap-1 font-mono ${getTrendColor()}`}>
          <span className="text-sm">{getTrendIcon()}</span>
          <span className="font-medium text-sm">
            USD 1 : KES {rate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveExchangeRate;
