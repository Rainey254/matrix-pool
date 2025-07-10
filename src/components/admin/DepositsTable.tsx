
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DepositRecord {
  id: string;
  userEmail: string;
  amount: number;
  transactionCode: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DepositsTableProps {
  deposits: DepositRecord[];
  onDeleteDeposit: (depositId: string, userEmail: string, amount: number) => void;
}

const DepositsTable = ({ deposits, onDeleteDeposit }: DepositsTableProps) => {
  return (
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
                            onClick={() => onDeleteDeposit(deposit.id, deposit.userEmail, deposit.amount)}
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
  );
};

export default DepositsTable;
