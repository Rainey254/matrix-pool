
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet, History, Settings, LogOut, X } from "lucide-react";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileMenuProps {
  onDepositClick: () => void;
  onHistoryClick: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  userFirstName?: string;
}

const MobileMenu = ({ 
  onDepositClick, 
  onHistoryClick, 
  onProfileClick, 
  onLogoutClick,
  userFirstName 
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="icon"
          className="fixed top-20 right-4 z-[9999] h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-xl border-2 border-purple-400 animate-pulse"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="bg-slate-900 border-slate-700 w-64 p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Menu</h2>
                {userFirstName && (
                  <p className="text-xs text-gray-400 mt-1">Welcome, {userFirstName}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-3">
            {/* Deposit Button */}
            <Button
              onClick={() => handleAction(onDepositClick)}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-start px-4 text-sm font-medium shadow-lg"
            >
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <Wallet className="h-4 w-4" />
              </div>
              Deposit Funds
            </Button>

            {/* History Button */}
            <Button
              onClick={() => handleAction(onHistoryClick)}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl flex items-center justify-start px-4 text-sm font-medium shadow-lg"
            >
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <History className="h-4 w-4" />
              </div>
              Trading History
            </Button>

            {/* Profile Button */}
            <Button
              onClick={() => handleAction(onProfileClick)}
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl flex items-center justify-start px-4 text-sm font-medium shadow-lg"
            >
              <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center mr-3">
                <Settings className="h-4 w-4" />
              </div>
              Profile & Settings
            </Button>

            {/* Logout Button */}
            <Button
              onClick={() => handleAction(onLogoutClick)}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-start px-4 text-sm font-medium shadow-lg"
            >
              <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4" />
              </div>
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
