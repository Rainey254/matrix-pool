import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChartLine, Users, Settings, LogOut, Wallet, History } from "lucide-react";
import TradingInterface from "./TradingInterface";
import AccountSwitcher from "./AccountSwitcher";
import PriceChart from "./PriceChart";
import DepositWithdraw from "./DepositWithdraw";
import UserProfile from "./UserProfile";
import TradingHistory from "./TradingHistory";
import { TermsAndConditions } from "@/components/legal/TermsAndConditions";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import MobileMenu from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";

const TradingDashboard = () => {
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo');
  const [demoBalance, setDemoBalance] = useState(10000);
  const [realBalance, setRealBalance] = useState(0);
  const [selectedInstrument, setSelectedInstrument] = useState('volatility_75');
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [recentMines, setRecentMines] = useState<any[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [winRate, setWinRate] = useState('~35%');
  const [winRateColor, setWinRateColor] = useState('text-red-400');
  const isMobile = useIsMobile();

  // Dynamic win rate that changes every 20 seconds
  useEffect(() => {
    const winRates = [
      { rate: '~35%', color: 'text-red-400' },
      { rate: '~42%', color: 'text-red-400' },
      { rate: '~28%', color: 'text-red-400' },
      { rate: '~51%', color: 'text-green-400' },
      { rate: '~48%', color: 'text-green-400' },
      { rate: '~65%', color: 'text-green-400' },
      { rate: '~38%', color: 'text-red-400' },
      { rate: '~59%', color: 'text-green-400' }
    ];

    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % winRates.length;
      setWinRate(winRates[currentIndex].rate);
      setWinRateColor(winRates[currentIndex].color);
    }, 20000); // Change every 20 seconds

    return () => clearInterval(interval);
  }, []);

  // Load user data on component mount
  useEffect(() => {
    const userEmail = authService.getCurrentUserEmail();
    if (!userEmail) {
      window.location.reload(); // Redirect to login if not authenticated
      return;
    }

    setCurrentUserEmail(userEmail);
    const userData = authService.getCurrentUserData();
    
    if (userData) {
      setDemoBalance(userData.demoBalance);
      setRealBalance(userData.realBalance);
      setAccountType(userData.accountType);
      setRecentMines(userData.recentMines);
      setUserFirstName(userData.profile.firstName || '');
    }
  }, []);

  // Save user data whenever relevant state changes
  useEffect(() => {
    if (currentUserEmail) {
      authService.updateUserBalance(currentUserEmail, demoBalance, realBalance);
    }
  }, [currentUserEmail, demoBalance, realBalance]);

  useEffect(() => {
    if (currentUserEmail) {
      authService.updateUserAccountType(currentUserEmail, accountType);
    }
  }, [currentUserEmail, accountType]);

  const handleLogout = () => {
    authService.logoutUser();
    window.location.reload();
  };

  const handleMineComplete = (mine: any) => {
    const updatedMines = [mine, ...recentMines.slice(0, 9)];
    setRecentMines(updatedMines);
    
    if (currentUserEmail) {
      authService.addUserTransaction(currentUserEmail, mine);
    }
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  const handleAccountChange = (type: 'demo' | 'real') => {
    setAccountType(type);
  };

  const handleBalanceChange = (newBalance: number) => {
    if (accountType === 'demo') {
      setDemoBalance(Math.max(0, newBalance));
    } else {
      setRealBalance(Math.max(0, newBalance));
    }
  };

  const handleDepositClick = () => {
    if (accountType === 'demo') {
      toast({
        title: "Switch to Real Account",
        description: "Deposits are only available for real accounts. Switching to real account now.",
        variant: "default",
      });
      setAccountType('real');
      setTimeout(() => {
        setActiveSheet('deposit');
      }, 500);
    } else {
      setActiveSheet('deposit');
    }
  };

  const handleProfileUpdate = (firstName: string) => {
    setUserFirstName(firstName);
  };

  const currentBalance = accountType === 'demo' ? demoBalance : realBalance;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ChartLine className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Matrix-pool</span>
            </div>
            <AccountSwitcher 
              accountType={accountType} 
              onAccountChange={handleAccountChange}
              balance={currentBalance}
              realBalance={realBalance}
            />
          </div>
          
          {/* Desktop Action Buttons - Hide on mobile */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              {userFirstName && (
                <span className="text-sm text-gray-400">
                  Welcome, {userFirstName}
                </span>
              )}
              <Badge variant="outline" className="text-green-400 border-green-400">
                {accountType === 'demo' ? 'Demo Account' : 'Real Account'}
              </Badge>
              
              {/* Action Buttons */}
              <Sheet open={activeSheet === 'deposit'} onOpenChange={(open) => !open && setActiveSheet(null)}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleDepositClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-700 w-full max-w-2xl">
                  <DepositWithdraw 
                    balance={currentBalance}
                    onBalanceChange={handleBalanceChange}
                    onClose={closeSheet}
                    accountType={accountType}
                    onMpesaDeposit={(amount) => {
                      // Handle M-Pesa deposit with 3-minute delay
                      toast({
                        title: "M-Pesa Deposit Processing",
                        description: `Your deposit of $${amount} is being processed. It will reflect in your account within 3 minutes.`,
                        duration: 5000,
                      });
                      
                      setTimeout(() => {
                        setRealBalance(prev => prev + amount);
                        toast({
                          title: "Deposit Successful",
                          description: `$${amount} has been added to your real account balance.`,
                        });
                      }, 3 * 60 * 1000); // 3 minutes delay
                    }}
                  />
                </SheetContent>
              </Sheet>

              <Sheet open={activeSheet === 'history'} onOpenChange={(open) => !open && setActiveSheet(null)}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setActiveSheet('history')}
                    className="bg-orange-600 hover:bg-orange-700 text-white border-0"
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-700 w-full max-w-4xl">
                  <TradingHistory 
                    onClose={closeSheet} 
                    accountType={accountType} 
                    userId={currentUserEmail || undefined} 
                  />
                </SheetContent>
              </Sheet>

              <Sheet open={activeSheet === 'profile'} onOpenChange={(open) => !open && setActiveSheet(null)}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setActiveSheet('profile')}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white border-0"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-700 w-full max-w-2xl">
                  <UserProfile onClose={closeSheet} onProfileUpdate={handleProfileUpdate} />
                </SheetContent>
              </Sheet>

              <TermsAndConditions className="text-gray-400 hover:text-white hover:bg-slate-700" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}

          {/* Mobile Badge - Show on mobile */}
          {isMobile && (
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
              {accountType === 'demo' ? 'Demo' : 'Real'}
            </Badge>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        onDepositClick={handleDepositClick}
        onHistoryClick={() => setActiveSheet('history')}
        onProfileClick={() => setActiveSheet('profile')}
        onLogoutClick={handleLogout}
        userFirstName={userFirstName}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Mining Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart with Live Indicator */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Live Market Data
                  <Badge className="bg-green-600 animate-pulse">
                    <span className="animate-pulse">●</span> LIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceChart 
                  selectedInstrument={selectedInstrument}
                  onInstrumentChange={setSelectedInstrument}
                />
              </CardContent>
            </Card>

            {/* Mining Interface */}
            <TradingInterface 
              balance={currentBalance}
              onBalanceChange={handleBalanceChange}
              accountType={accountType}
              selectedInstrument={selectedInstrument}
              onTradeComplete={handleMineComplete}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-white font-medium">
                    ${currentBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Account Type:</span>
                  <span className="text-white font-medium capitalize">
                    {accountType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate (Historical):</span>
                  <span className={`${winRateColor} font-medium`}>{winRate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Mines */}
            {recentMines.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Recent Mines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentMines.slice(0, 5).map((mine, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                      <div className="text-xs">
                        <span className="text-white">{mine.type}</span>
                        <span className="text-gray-400 ml-2">${mine.amount}</span>
                      </div>
                      <Badge className={mine.result === 'win' ? 'bg-green-600' : 'bg-red-600'}>
                        {mine.result === 'win' ? `+$${Math.abs(mine.payout)}` : `-$${Math.abs(mine.payout)}`}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="sm"
                  onClick={handleDepositClick}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {accountType === 'demo' ? 'Switch & Deposit' : 'Deposit Funds'}
                </Button>
                {accountType === 'real' && (
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" 
                    size="sm"
                    onClick={() => setActiveSheet('deposit')}
                  >
                    Withdraw
                  </Button>
                )}
                {accountType === 'demo' && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    size="sm"
                    onClick={() => setAccountType('real')}
                  >
                    Switch to Real Account
                  </Button>
                )}
                <Button 
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white" 
                  size="sm"
                  onClick={() => setActiveSheet('profile')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Market Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Synthetic Markets</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 text-sm">24/7 Open</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Forex Markets</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span className="text-yellow-400 text-sm">Limited Hours</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Crypto Markets</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 text-sm">24/7 Open</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <Sheet open={activeSheet === 'deposit'} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent className="bg-slate-900 border-slate-700 w-full max-w-2xl">
          <DepositWithdraw 
            balance={currentBalance}
            onBalanceChange={handleBalanceChange}
            onClose={closeSheet}
            accountType={accountType}
            onMpesaDeposit={(amount) => {
              // Handle M-Pesa deposit with 3-minute delay
              toast({
                title: "M-Pesa Deposit Processing",
                description: `Your deposit of $${amount} is being processed. It will reflect in your account within 3 minutes.`,
                duration: 5000,
              });
              
              setTimeout(() => {
                setRealBalance(prev => prev + amount);
                toast({
                  title: "Deposit Successful",
                  description: `$${amount} has been added to your real account balance.`,
                });
              }, 3 * 60 * 1000); // 3 minutes delay
            }}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={activeSheet === 'history'} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent className="bg-slate-900 border-slate-700 w-full max-w-4xl">
          <TradingHistory onClose={closeSheet} />
        </SheetContent>
      </Sheet>

      <Sheet open={activeSheet === 'profile'} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent className="bg-slate-900 border-slate-700 w-full max-w-2xl">
          <UserProfile onClose={closeSheet} onProfileUpdate={handleProfileUpdate} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TradingDashboard;
