
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { UserAccount, authService } from "@/services/authService";

interface UsersTableProps {
  users: UserAccount[];
  showPasswords: boolean;
  onDeleteUser: (userEmail: string) => void;
}

const UsersTable = ({ users, showPasswords, onDeleteUser }: UsersTableProps) => {
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

  return (
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
                              onClick={() => onDeleteUser(user.email)}
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
  );
};

export default UsersTable;
