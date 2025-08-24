
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Wifi, WifiOff } from "lucide-react";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";

interface TradingHistoryProps {
  onClose: () => void;
  accountType?: 'demo' | 'real';
  userId?: string;
}

const TradingHistory = ({ onClose, accountType = 'demo', userId }: TradingHistoryProps) => {
  const { transactions, isConnected, addTransaction } = useRealtimeTransactions(accountType, userId);
  
  const [tradeHistory] = useState([
    {
      id: "1",
      instrument: "Volatility 75",
      type: "UP",
      amount: 25,
      multiplier: 100,
      payout: 25,
      result: "win",
      timestamp: "2025-01-06 14:30:15",
      duration: "2m 15s"
    },
    {
      id: "2",
      instrument: "Boom 1000",
      type: "DOWN",
      amount: 50,
      multiplier: 250,
      payout: -50,
      result: "loss",
      timestamp: "2025-01-06 14:25:42",
      duration: "1m 45s"
    },
    {
      id: "3",
      instrument: "Crash 500",
      type: "UP",
      amount: 10,
      multiplier: 500,
      payout: 50,
      result: "win",
      timestamp: "2025-01-06 14:20:18",
      duration: "3m 12s"
    },
    {
      id: "4",
      instrument: "Volatility 25",
      type: "DOWN",
      amount: 75,
      multiplier: 150,
      payout: -75,
      result: "loss",
      timestamp: "2025-01-06 14:15:33",
      duration: "2m 8s"
    },
    {
      id: "5",
      instrument: "Step Index",
      type: "UP",
      amount: 30,
      multiplier: 200,
      payout: 60,
      result: "win",
      timestamp: "2025-01-06 14:10:55",
      duration: "4m 22s"
    }
  ]);

  const totalPnL = tradeHistory.reduce((sum, trade) => sum + trade.payout, 0);
  const winRate = (tradeHistory.filter(trade => trade.result === "win").length / tradeHistory.length) * 100;

  return (
    <div className="h-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="h-6 w-6" />
          Mine History
          <div className="flex items-center gap-1 ml-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs text-gray-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-400">
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalPnL > 0 ? '+' : ''}${totalPnL}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-xl font-bold text-blue-400">{winRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-xl font-bold text-white">{tradeHistory.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="trades" className="text-white">Mine History</TabsTrigger>
            <TabsTrigger value="transactions" className="text-white">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Instrument</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">Multiplier</TableHead>
                      <TableHead className="text-gray-400">P&L</TableHead>
                      <TableHead className="text-gray-400">Result</TableHead>
                      <TableHead className="text-gray-400">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeHistory.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="text-white">{trade.instrument}</TableCell>
                        <TableCell>
                          <Badge className={trade.type === 'UP' ? 'bg-green-600' : 'bg-red-600'}>
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">${trade.amount}</TableCell>
                        <TableCell className="text-white">x{trade.multiplier}</TableCell>
                        <TableCell className={trade.payout >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${trade.payout > 0 ? '+' : ''}{trade.payout}
                        </TableCell>
                        <TableCell>
                          <Badge className={trade.result === 'win' ? 'bg-green-600' : 'bg-red-600'}>
                            {trade.result.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">{trade.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Mine History
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
                      {isConnected ? 'Real-time' : 'Offline'}
                    </Badge>
                    <Badge className="bg-blue-600 text-xs">
                      {accountType === 'demo' ? 'Demo' : 'Live'} Account
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Method</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {transactions
                    .filter(t => t.type !== 'trade')
                    .map((transaction) => (
                    <TableRow key={transaction.id} className={transaction.timestamp > new Date(Date.now() - 10000).toISOString() ? 'animate-pulse bg-green-500/10' : ''}>
                      <TableCell>
                        <Badge className={transaction.type === 'deposit' ? 'bg-green-600' : 'bg-blue-600'}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{transaction.method || 'N/A'}</TableCell>
                      <TableCell className="text-white">${transaction.amount}</TableCell>
                      <TableCell>
                        <Badge className={
                          transaction.status === 'completed' ? 'bg-green-600' : 
                          transaction.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                        }>
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.filter(t => t.type !== 'trade').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                        No transactions yet. Start trading to see your history here.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TradingHistory;
