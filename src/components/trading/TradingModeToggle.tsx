import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap } from "lucide-react";

interface TradingModeToggleProps {
  mode: 'spot' | 'futures';
  onModeChange: (mode: 'spot' | 'futures') => void;
}

export const TradingModeToggle = ({ mode, onModeChange }: TradingModeToggleProps) => {
  return (
    <div className="flex items-center gap-4">
      <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'spot' | 'futures')}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="spot" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Spot Trading
          </TabsTrigger>
          <TabsTrigger value="futures" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Futures Trading
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Badge 
        variant="outline" 
        className={mode === 'spot' ? 'border-green-500 text-green-400' : 'border-orange-500 text-orange-400'}
      >
        {mode === 'spot' ? 'Spot' : 'Futures'} Mode
      </Badge>
    </div>
  );
};