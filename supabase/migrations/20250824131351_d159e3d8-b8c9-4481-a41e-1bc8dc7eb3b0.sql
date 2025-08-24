-- Create trading accounts table
CREATE TABLE public.trading_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('demo', 'real', 'spot', 'futures')),
  balance DECIMAL(15,8) NOT NULL DEFAULT 0,
  available_balance DECIMAL(15,8) NOT NULL DEFAULT 0,
  margin_balance DECIMAL(15,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trading pairs table
CREATE TABLE public.trading_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  price_change_24h DECIMAL(10,4) DEFAULT 0,
  volume_24h DECIMAL(20,8) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  market_type TEXT NOT NULL CHECK (market_type IN ('spot', 'futures', 'both')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id),
  trading_pair_id UUID NOT NULL REFERENCES public.trading_pairs(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8),
  filled_quantity DECIMAL(20,8) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'partial')),
  leverage INTEGER DEFAULT 1,
  margin_required DECIMAL(15,8) DEFAULT 0,
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create positions table for futures trading
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.trading_accounts(id),
  trading_pair_id UUID NOT NULL REFERENCES public.trading_pairs(id),
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  quantity DECIMAL(20,8) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  current_price DECIMAL(20,8) NOT NULL,
  leverage INTEGER NOT NULL DEFAULT 1,
  margin_used DECIMAL(15,8) NOT NULL,
  unrealized_pnl DECIMAL(15,8) DEFAULT 0,
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market data table for real-time prices
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_pair_id UUID NOT NULL REFERENCES public.trading_pairs(id),
  price DECIMAL(20,8) NOT NULL,
  volume DECIMAL(20,8) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trading_accounts
CREATE POLICY "Users can view their own trading accounts" 
ON public.trading_accounts FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own trading accounts" 
ON public.trading_accounts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own trading accounts" 
ON public.trading_accounts FOR UPDATE 
USING (true);

-- Create RLS policies for trading_pairs (public read access)
CREATE POLICY "Trading pairs are viewable by everyone" 
ON public.trading_pairs FOR SELECT 
USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own orders" 
ON public.orders FOR UPDATE 
USING (true);

-- Create RLS policies for positions
CREATE POLICY "Users can view their own positions" 
ON public.positions FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own positions" 
ON public.positions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own positions" 
ON public.positions FOR UPDATE 
USING (true);

-- Create RLS policies for market_data (public read access)
CREATE POLICY "Market data is viewable by everyone" 
ON public.market_data FOR SELECT 
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_trading_accounts_updated_at
BEFORE UPDATE ON public.trading_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_pairs_updated_at
BEFORE UPDATE ON public.trading_pairs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample trading pairs
INSERT INTO public.trading_pairs (symbol, base_asset, quote_asset, price, market_type) VALUES
('BTCUSDT', 'BTC', 'USDT', 43500.50, 'both'),
('ETHUSDT', 'ETH', 'USDT', 2850.75, 'both'),
('BNBUSDT', 'BNB', 'USDT', 245.30, 'both'),
('ADAUSDT', 'ADA', 'USDT', 0.485, 'both'),
('DOTUSDT', 'DOT', 'USDT', 7.25, 'both'),
('LINKUSDT', 'LINK', 'USDT', 15.80, 'both'),
('LTCUSDT', 'LTC', 'USDT', 95.45, 'both'),
('XRPUSDT', 'XRP', 'USDT', 0.625, 'both'),
('SOLUSDT', 'SOL', 'USDT', 78.90, 'both'),
('MATICUSDT', 'MATIC', 'USDT', 1.15, 'both');

-- Enable realtime for tables
ALTER TABLE public.trading_pairs REPLICA IDENTITY FULL;
ALTER TABLE public.market_data REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.positions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_pairs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;