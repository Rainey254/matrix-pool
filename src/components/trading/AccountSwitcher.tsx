
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface AccountSwitcherProps {
  accountType: 'demo' | 'real';
  onAccountChange: (type: 'demo' | 'real') => void;
  balance: number;
  realBalance: number;
}

const AccountSwitcher = ({ accountType, onAccountChange, balance, realBalance }: AccountSwitcherProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-purple-600 text-white hover:bg-purple-700 bg-purple-600/20">
          <div className="flex items-center space-x-2">
            <div className="text-left">
              <div className="text-sm font-medium">${balance.toLocaleString()}</div>
              <div className="text-xs text-purple-200 capitalize">{accountType} Account</div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-800 border-slate-700">
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Switch Account</h4>
          
          <div className="space-y-2">
            <div 
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                accountType === 'demo' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => onAccountChange('demo')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Demo Account</div>
                  <div className="text-sm text-gray-400">Risk-free mining</div>
                </div>
                <div className="text-right">
                  <div className="text-white">$10,000</div>
                  <Badge className="bg-blue-600 text-xs">Demo</Badge>
                </div>
              </div>
            </div>

            <div 
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                accountType === 'real' 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => onAccountChange('real')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Real Account</div>
                  <div className="text-sm text-gray-400">Live mining</div>
                </div>
                <div className="text-right">
                  <div className="text-white">${realBalance.toLocaleString()}</div>
                  <Badge className="bg-green-600 text-xs">Live</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AccountSwitcher;
