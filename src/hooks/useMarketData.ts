import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TradingPair {
  id: string;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price: number;
  price_change_24h: number;
  volume_24h: number;
  market_type: 'spot' | 'futures' | 'both';
}

export interface MarketDataPoint {
  id: string;
  trading_pair_id: string;
  price: number;
  volume: number;
  timestamp: string;
}

export const useMarketData = () => {
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketDataPoint[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial trading pairs
  useEffect(() => {
    const fetchTradingPairs = async () => {
      try {
        const { data, error } = await supabase
          .from('trading_pairs')
          .select('*')
          .eq('is_active', true)
          .order('symbol');

        if (error) throw error;
        setTradingPairs((data || []).map(pair => ({
          ...pair,
          market_type: pair.market_type as 'spot' | 'futures' | 'both'
        })));
      } catch (error) {
        console.error('Error fetching trading pairs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradingPairs();
  }, []);

  // Set up real-time subscriptions for price updates
  useEffect(() => {
    if (tradingPairs.length === 0) return;

    const channel = supabase
      .channel('trading-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trading_pairs'
        },
        (payload) => {
          setTradingPairs(prev => 
            prev.map(pair => 
              pair.id === payload.new.id 
                ? { ...pair, ...payload.new }
                : pair
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_data'
        },
        (payload) => {
          const newData = payload.new as MarketDataPoint;
          setMarketData(prev => ({
            ...prev,
            [newData.trading_pair_id]: [
              ...(prev[newData.trading_pair_id] || []).slice(-99),
              newData
            ]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tradingPairs]);

  // Simulate real-time price updates
  useEffect(() => {
    if (tradingPairs.length === 0) return;

    const interval = setInterval(async () => {
      for (const pair of tradingPairs) {
        const volatility = pair.symbol.includes('BTC') ? 500 : 
                          pair.symbol.includes('ETH') ? 50 : 
                          10;
        
        const priceChange = (Math.random() - 0.5) * volatility * 0.01;
        const newPrice = Math.max(0.01, pair.price + priceChange);
        const priceChange24h = ((newPrice - pair.price) / pair.price) * 100;

        try {
          // Update trading pair price
          await supabase
            .from('trading_pairs')
            .update({ 
              price: newPrice,
              price_change_24h: priceChange24h
            })
            .eq('id', pair.id);

          // Insert market data point
          await supabase
            .from('market_data')
            .insert({
              trading_pair_id: pair.id,
              price: newPrice,
              volume: Math.random() * 1000
            });
        } catch (error) {
          console.error('Error updating market data:', error);
        }
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [tradingPairs]);

  return {
    tradingPairs,
    marketData,
    isLoading
  };
};