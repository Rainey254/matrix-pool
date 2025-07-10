
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Users, CreditCard, Shield, RefreshCw, Eye, EyeOff } from "lucide-react";
import { authService, UserAccount } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

interface DepositRecord {
  id: string;
  userEmail: string;
  amount: number;
  transactionCode: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminPanel = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setLoading(true);
    console.log('Loading admin data...');
    
    try {
      loadUsers();
      loadDeposits();
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load admin data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = () => {
    console.log('Loading users...');
    const allUsers = authService.getAllUsers();
    console.log('Found users:', allUsers);
    setUsers(allUsers);
  };

  const loadDeposits = () => {
    console.log('Loading deposits...');
    const allUsers = authService.getAllUsers();
    const allDeposits: DepositRecord[] = [];
    
    allUsers.forEach(user => {
      const userData = authService.getUserData(user.email);
      console.log(`User data for ${user.email}:`, userData);
      
      if (userData && userData.deposits && Array.isArray(userData.deposits)) {
        userData.deposits.forEach((deposit: any, index: number) => {
          allDeposits.push({
            id: `${user.email}-${deposit.date || index}`,
            userEmail: user.email,
            amount: deposit.amount || 0,
            transactionCode: deposit.transactionCode || 'N/A',
            date: deposit.date || new Date().toISOString(),
            status: deposit.status || 'approved'
          });
        });
      }
    });
    
    console.log('All deposits:', allDeposits);
    setDeposits(allDeposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteDeposit = (depositId: string, userEmail: string, amount: number) => {
    console.log(`Deleting deposit ${depositId} for user ${userEmail}`);
    
    const userData = authService.getUserData(userEmail);
    if (userData) {
      // Remove deposit from user's deposit history
      userData.deposits = userData.deposits.filter((dep: any) => 
        `${userEmail}-${dep.date || dep.id}` !== depositId
      );
      
      // Reset user's real balance to 0
      userData.realBalance = 0;
      
      authService.saveUserData(userEmail, userData);
      
      // Reload data
      loadAllData();
      
      toast({
        title: "Deposit Deleted",
        description: `Deposit removed and ${userEmail}'s balance reset to $0`,
      });
    } else {
      toast({
        title: "Error",
        description: "User data not found",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = (userEmail: string) => {
    console.log(`Deleting user: ${userEmail}`);
    
    const success = authService.deleteUser(userEmail);
    
    if (success) {
      // Reload data
      loadAllData();
      
      toast({
        title: "User Deleted",
        description: `User ${userEmail} has been permanently deleted`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const getUserBalance = (userEmail: string) => {
    const userData = authService.getUserData(userEmail);
    if (userData) {
      return {
        demo: userData.demoBalance || 0,
        real: userData.realBalance || 0,
        accountType: userData.accountType || 'demo'
      };
    }
    return { demo: 0, real: 0, accountType: 'demo' };
  };

  const getTotalRealBalance = () => {
    return users.reduce((total, user) => {
      const balance = getUserBalance(user.email);
      return total + balance.real;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowPasswords(!showPasswords)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Hide' : 'Show'} Passwords
            </Button>
            <Button onClick={loadAllData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deposits.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposit Value</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${deposits.reduce((sum, dep) => sum + dep.amount, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Real Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${getTotalRealBalance().toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users ({users.length}) - Tracked by Email</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registered users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email (ID)</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Demo Balance</TableHead>
                    <TableHead>Real Balance</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const balance = getUserBalance(user.email);
                    return (
                      <TableRow key={user.email}>
                        <TableCell className="font-medium text-blue-600">{user.email}</TableCell>
                        <TableCell className="font-mono">
                          {showPasswords ? user.password : '••••••••'}
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>{user.country || 'N/A'}</TableCell>
                        <TableCell>${balance.demo.toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          ${balance.real.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={balance.accountType === 'real' ? 'default' : 'secondary'}>
                            {balance.accountType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete {user.email}? This action cannot be undone and the user will no longer be able to login.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Deposits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit History ({deposits.length}) - Tracked by User Email</CardTitle>
          </CardHeader>
          <CardContent>
            {deposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deposits found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email (ID)</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction Code</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium text-blue-600">{deposit.userEmail}</TableCell>
                      <TableCell className="font-bold text-green-600">${deposit.amount.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">{deposit.transactionCode}</TableCell>
                      <TableCell>{new Date(deposit.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={deposit.status === 'approved' ? 'default' : 'secondary'}>
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Fake Deposit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this deposit? This will remove the deposit from {deposit.userEmail}'s history and reset their balance to $0.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDeposit(deposit.id, deposit.userEmail, deposit.amount)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Deposit
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
