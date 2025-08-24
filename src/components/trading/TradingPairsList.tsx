import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star } from "lucide-react";
import { TradingPair } from "@/hooks/useMarketData";

interface TradingPairsListProps {
  pairs: TradingPair[];
  selectedPair: TradingPair | null;
  onPairSelect: (pair: TradingPair) => void;
  tradingMode: 'spot' | 'futures';
}

export const TradingPairsList = ({ 
  pairs, 
  selectedPair, 
  onPairSelect, 
  tradingMode 
}: TradingPairsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredPairs = pairs.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pair.base_asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = pair.market_type === 'both' || pair.market_type === tradingMode;
    return matchesSearch && matchesMode;
  });

  const toggleFavorite = (pairId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(pairId)) {
      newFavorites.delete(pairId);
    } else {
      newFavorites.add(pairId);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price: number) => {
    return price < 1 ? price.toFixed(6) : price.toFixed(2);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Market Prices</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search pairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredPairs.map((pair) => (
            <div
              key={pair.id}
              onClick={() => onPairSelect(pair)}
              className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                selectedPair?.id === pair.id ? 'bg-slate-700' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pair.id);
                    }}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        favorites.has(pair.id) ? 'fill-yellow-400 text-yellow-400' : ''
                      }`} 
                    />
                  </button>
                  <div>
                    <div className="text-white font-medium">{pair.symbol}</div>
                    <div className="text-xs text-gray-400">
                      {pair.base_asset}/{pair.quote_asset}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-mono">
                    ${formatPrice(pair.price)}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      pair.price_change_24h >= 0 
                        ? 'text-green-400 border-green-400' 
                        : 'text-red-400 border-red-400'
                    }`}
                  >
                    {pair.price_change_24h >= 0 ? '+' : ''}{pair.price_change_24h.toFixed(2)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>24h Vol: ${pair.volume_24h.toLocaleString()}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs border-blue-400 text-blue-400"
                >
                  {pair.market_type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};