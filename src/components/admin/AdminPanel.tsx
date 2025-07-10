
import React, { useState, useEffect } from 'react';
import { RefreshCw } from "lucide-react";
import { authService, UserAccount } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import AdminHeader from './AdminHeader';
import AdminStats from './AdminStats';
import UsersTable from './UsersTable';
import DepositsTable from './DepositsTable';

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
    
    // Set up interval to refresh data every 5 seconds to catch new registrations
    const interval = setInterval(() => {
      loadAllData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAllData = () => {
    console.log('=== ADMIN PANEL: Loading all data ===');
    
    try {
      // Load users first
      const allUsers = authService.getAllUsers();
      console.log('Raw users from authService:', allUsers);
      console.log('Number of users found:', allUsers.length);
      
      if (allUsers.length === 0) {
        console.log('No users found in localStorage. Checking localStorage directly...');
        const rawUsersData = localStorage.getItem('registeredUsers');
        console.log('Raw localStorage registeredUsers data:', rawUsersData);
        
        // Try to parse manually to see if there's corrupted data
        if (rawUsersData) {
          try {
            const parsedUsers = JSON.parse(rawUsersData);
            console.log('Successfully parsed users:', parsedUsers);
          } catch (parseError) {
            console.error('Error parsing users data:', parseError);
          }
        }
      }
      
      setUsers(allUsers);
      
      // Load deposits
      loadDeposits(allUsers);
      
      console.log('=== ADMIN PANEL: Data loading complete ===');
      
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

  const loadDeposits = (usersList: UserAccount[]) => {
    console.log('Loading deposits for users:', usersList.length);
    const allDeposits: DepositRecord[] = [];
    
    usersList.forEach(user => {
      console.log(`Checking deposits for user: ${user.email}`);
      const userData = authService.getUserData(user.email);
      console.log(`User data for ${user.email}:`, userData);
      
      if (userData && userData.deposits && Array.isArray(userData.deposits)) {
        console.log(`Found ${userData.deposits.length} deposits for ${user.email}`);
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
      } else {
        console.log(`No deposits found for ${user.email}`);
      }
    });
    
    console.log('Total deposits loaded:', allDeposits.length);
    setDeposits(allDeposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteDeposit = (depositId: string, userEmail: string, amount: number) => {
    console.log(`Deleting deposit ${depositId} for user ${userEmail}`);
    
    const userData = authService.getUserData(userEmail);
    if (userData) {
      userData.deposits = userData.deposits.filter((dep: any) => 
        `${userEmail}-${dep.date || dep.id}` !== depositId
      );
      userData.realBalance = 0;
      authService.saveUserData(userEmail, userData);
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

  const getTotalRealBalance = () => {
    return users.reduce((total, user) => {
      const userData = authService.getUserData(user.email);
      return total + (userData?.realBalance || 0);
    }, 0);
  };

  // Debug information
  console.log('Current admin panel state:');
  console.log('- Users:', users.length);
  console.log('- Deposits:', deposits.length);
  console.log('- Loading:', loading);

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
        <AdminHeader 
          showPasswords={showPasswords}
          onTogglePasswords={() => setShowPasswords(!showPasswords)}
          onRefresh={loadAllData}
        />

        {/* Debug info for development */}
        <div className="bg-muted p-4 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Total Users Found: {users.length}</p>
          <p>Total Deposits Found: {deposits.length}</p>
          <p>Last Refresh: {new Date().toLocaleTimeString()}</p>
          {users.length === 0 && (
            <p className="text-orange-600 mt-2">
              ⚠️ No users found. If you expect users to be registered, check the browser console for errors.
            </p>
          )}
        </div>

        <AdminStats 
          users={users}
          deposits={deposits}
          totalRealBalance={getTotalRealBalance()}
        />

        <UsersTable 
          users={users}
          showPasswords={showPasswords}
          onDeleteUser={handleDeleteUser}
        />

        <DepositsTable 
          deposits={deposits}
          onDeleteDeposit={handleDeleteDeposit}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
