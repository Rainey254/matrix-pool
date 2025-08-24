
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet, History, Settings, LogOut, X } from "lucide-react";
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
          className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg border-2 border-purple-400"
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="bg-slate-900 border-slate-700 w-80 p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Menu</h2>
                {userFirstName && (
                  <p className="text-sm text-gray-400 mt-1">Welcome, {userFirstName}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6 space-y-4">
            {/* Deposit Button */}
            <Button
              onClick={() => handleAction(onDepositClick)}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-start px-6 text-lg font-medium shadow-lg"
            >
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                <Wallet className="h-5 w-5" />
              </div>
              Deposit Funds
            </Button>

            {/* History Button */}
            <Button
              onClick={() => handleAction(onHistoryClick)}
              className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl flex items-center justify-start px-6 text-lg font-medium shadow-lg"
            >
              <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <History className="h-5 w-5" />
              </div>
              Trading History
            </Button>

            {/* Profile Button */}
            <Button
              onClick={() => handleAction(onProfileClick)}
              className="w-full h-16 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl flex items-center justify-start px-6 text-lg font-medium shadow-lg"
            >
              <div className="h-10 w-10 bg-cyan-500 rounded-full flex items-center justify-center mr-4">
                <Settings className="h-5 w-5" />
              </div>
              Profile & Settings
            </Button>

            {/* Logout Button */}
            <Button
              onClick={() => handleAction(onLogoutClick)}
              className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-start px-6 text-lg font-medium shadow-lg"
            >
              <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <LogOut className="h-5 w-5" />
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
