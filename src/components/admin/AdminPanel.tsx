
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Users, CreditCard, Shield } from "lucide-react";
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
  
  useEffect(() => {
    loadUsers();
    loadDeposits();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getAllUsers();
    setUsers(allUsers);
  };

  const loadDeposits = () => {
    // Load deposits from localStorage for all users
    const allUsers = authService.getAllUsers();
    const allDeposits: DepositRecord[] = [];
    
    allUsers.forEach(user => {
      const userData = authService.getUserData(user.email);
      if (userData && userData.deposits) {
        userData.deposits.forEach((deposit: any) => {
          allDeposits.push({
            id: `${user.email}-${deposit.date}`,
            userEmail: user.email,
            amount: deposit.amount,
            transactionCode: deposit.transactionCode || 'N/A',
            date: deposit.date,
            status: deposit.status || 'approved'
          });
        });
      }
    });
    
    setDeposits(allDeposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteDeposit = (depositId: string, userEmail: string, amount: number) => {
    const userData = authService.getUserData(userEmail);
    if (userData) {
      // Remove deposit from user's deposit history
      userData.deposits = userData.deposits.filter((dep: any) => 
        `${userEmail}-${dep.date}` !== depositId
      );
      
      // Reset user's real balance to 0
      userData.realBalance = 0;
      
      authService.saveUserData(userEmail, userData);
      
      // Reload data
      loadDeposits();
      
      toast({
        title: "Deposit Deleted",
        description: `Deposit removed and ${userEmail}'s balance reset to $0`,
      });
    }
  };

  const handleDeleteUser = (userEmail: string) => {
    // Get all users
    const allUsers = authService.getAllUsers();
    
    // Remove user from registered users
    const updatedUsers = allUsers.filter(user => user.email !== userEmail);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Remove user's data
    localStorage.removeItem(`user_${userEmail}_data`);
    
    // If this is the current user, log them out
    if (authService.getCurrentUserEmail() === userEmail) {
      authService.logoutUser();
    }
    
    // Reload data
    loadUsers();
    loadDeposits();
    
    toast({
      title: "User Deleted",
      description: `User ${userEmail} has been permanently deleted`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.country || 'N/A'}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Deposits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
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
                    <TableCell className="font-medium">{deposit.userEmail}</TableCell>
                    <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                    <TableCell>{deposit.transactionCode}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
