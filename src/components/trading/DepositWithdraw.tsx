import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Wallet, Smartphone, Copy } from "lucide-react";
import { playMT5NotificationSound } from "@/utils/soundUtils";

interface DepositWithdrawProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onClose: () => void;
  accountType: 'demo' | 'real';
  onMpesaDeposit?: (amount: number) => void;
}

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", address: "19o8icNcdHMdEyCsLkbCJoK1VQKhzv2GV4" },
  { symbol: "ETH", name: "Ethereum", address: "0x087f086ec5e885ad3661ff679a57e314436e5219" },
  { symbol: "USDT", name: "Tether/Trc20", address: "TEX8xo3eU1GSo7xqkS4xatBTUzJy12QeaA" },
  { symbol: "BNB", name: "Binance Coin", address: "0x087f086ec5e885ad3661ff679a57e314436e5219" },
  { symbol: "USDC", name: "USD Coin", address: "0x087f086ec5e885ad3661ff679a57e314436e5219" },
  { symbol: "LTC", name: "Litecoin", address: "LU4B1uD35c3Y7vEa9Jp6wmRiwBHWkzWFxc" }
];

const DepositWithdraw = ({ balance, onBalanceChange, onClose, accountType, onMpesaDeposit }: DepositWithdrawProps) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        duration: 2000,
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    });
  };

  // Don't allow deposits on demo accounts
  if (accountType === 'demo') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Deposit & Withdraw</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            ✕
          </Button>
        </div>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-yellow-400 text-lg">
                ⚠️ Demo Account Limitation
              </div>
              <p className="text-gray-300">
                Deposits and withdrawals are only available for Real Accounts.
              </p>
              <p className="text-gray-400 text-sm">
                Please switch to a Real Account to access these features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCryptoDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCrypto) {
      toast({
        title: "Select cryptocurrency",
        description: "Please select a cryptocurrency for deposit",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate successful deposit
    setTimeout(() => {
      onBalanceChange(balance + amount);
      toast({
        title: "Deposit Successful",
        description: `$${amount} deposited via ${selectedCrypto}`,
      });
      setDepositAmount("");
      setIsProcessing(false);
    }, 2000);
  };

  const handleMpesaDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0 || !transactionCode) {
      toast({
        title: "Invalid details",
        description: "Please fill all required fields including transaction code",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Show initial confirmation
    toast({
      title: "M-Pesa Payment Received",
      description: `Processing deposit of $${amount}. Your balance will be updated in 3 minutes.`,
      duration: 5000,
    });

    // Set up 3-minute delay with sound notification
    setTimeout(() => {
      // Play MT5 notification sound
      playMT5NotificationSound();
      
      // Update balance
      const newBalance = balance + amount;
      onBalanceChange(newBalance);
      
      // Show success notification
      toast({
        title: "Deposit Successful! 🎉",
        description: `$${amount} has been added to your account. New balance: $${newBalance.toLocaleString()}`,
        duration: 8000,
      });
    }, 3 * 60 * 1000); // 3 minutes
    
    setDepositAmount("");
    setTransactionCode("");
    setIsProcessing(false);
    onClose(); // Close the deposit modal after initiating
  };

  const handleCryptoWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient funds",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    if (!cryptoAddress) {
      toast({
        title: "Missing address",
        description: "Please enter your crypto wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate successful withdrawal
    setTimeout(() => {
      onBalanceChange(balance - amount);
      toast({
        title: "Crypto Withdrawal Successful",
        description: `$${amount} withdrawal processed to your crypto wallet`,
      });
      setWithdrawAmount("");
      setCryptoAddress("");
      setIsProcessing(false);
    }, 2000);
  };

  const handleMpesaWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient funds",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    if (!mpesaPhone) {
      toast({
        title: "Missing phone number",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate successful M-Pesa withdrawal
    setTimeout(() => {
      onBalanceChange(balance - amount);
      toast({
        title: "M-Pesa Withdrawal Initiated",
        description: `$${amount} withdrawal to ${mpesaPhone}. Processing will take 24-48 hours.`,
        duration: 5000,
      });
      setWithdrawAmount("");
      setMpesaPhone("");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Deposit & Withdraw</h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-400">
          ✕
        </Button>
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700">
          <TabsTrigger value="deposit" className="text-white">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw" className="text-white">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-600">
              <TabsTrigger value="mobile" className="text-white">
                <Smartphone className="h-4 w-4 mr-2" />
                M-Pesa
              </TabsTrigger>
              <TabsTrigger value="crypto" className="text-white">
                <Wallet className="h-4 w-4 mr-2" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">M-Pesa Deposit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">M-Pesa Payment Details:</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Paybill:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">529901</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard("529901", "Paybill number")}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Account No:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono">2092023892002</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard("2092023892002", "Account number")}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-slate-700 border-slate-600 text-white"
                      min="5"
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">M-Pesa Transaction Code</label>
                    <Input
                      type="text"
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      placeholder="Enter M-Pesa confirmation code"
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="p-3 bg-blue-900 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      💡 Send payment to the paybill above, then enter your M-Pesa confirmation code here.
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-900 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      ⏱️ Your deposit will be processed and reflected in your account within 3 minutes after verification.
                    </p>
                  </div>

                  <Button 
                    onClick={handleMpesaDeposit} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Verifying..." : "Verify M-Pesa Payment"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Crypto Deposit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Select Cryptocurrency</label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose crypto" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {cryptoOptions.map((crypto) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol} className="text-white">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{crypto.symbol}</span>
                              <span className="text-gray-400">- {crypto.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCrypto && (
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Deposit Address:</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-mono text-sm break-all flex-1">
                          {cryptoOptions.find(c => c.symbol === selectedCrypto)?.address}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(
                            cryptoOptions.find(c => c.symbol === selectedCrypto)?.address || "",
                            `${selectedCrypto} address`
                          )}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedCrypto === 'BNB' && (
                        <div className="mt-3 p-3 bg-slate-600 rounded">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Binance ID:</p>
                              <p className="text-white font-mono text-sm">729404507</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard("729404507", "Binance ID")}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-slate-700 border-slate-600 text-white"
                      min="10"
                      disabled={isProcessing}
                    />
                  </div>

                  <Button 
                    onClick={handleCryptoDeposit} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Confirm Crypto Deposit"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="withdraw">
          <Tabs defaultValue="mpesa" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-600">
              <TabsTrigger value="mpesa" className="text-white">
                <Smartphone className="h-4 w-4 mr-2" />
                M-Pesa
              </TabsTrigger>
              <TabsTrigger value="crypto" className="text-white">
                <Wallet className="h-4 w-4 mr-2" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">M-Pesa Withdrawal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Available Balance:</span>
                      <span className="text-green-400 font-medium">${balance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Withdrawal Amount (USD)</label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-slate-700 border-slate-600 text-white"
                      max={balance}
                      min="5"
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">M-Pesa Phone Number</label>
                    <Input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="+254 xxx xxx xxx"
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="p-3 bg-yellow-900 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      ⏱️ M-Pesa withdrawals are processed within 24-48 hours during business days.
                    </p>
                  </div>

                  <Button 
                    onClick={handleMpesaWithdraw} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Process M-Pesa Withdrawal"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crypto">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Crypto Withdrawal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Available Balance:</span>
                      <span className="text-green-400 font-medium">${balance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Withdrawal Amount (USD)</label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-slate-700 border-slate-600 text-white"
                      max={balance}
                      min="10"
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Crypto Address</label>
                    <Input
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      placeholder="Enter your crypto wallet address"
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isProcessing}
                    />
                  </div>

                  <Button 
                    onClick={handleCryptoWithdraw} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Process Crypto Withdrawal"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositWithdraw;
