
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
    
    // Set up interval to refresh data every 3 seconds for real-time updates
    const interval = setInterval(() => {
      loadAllData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadAllData = () => {
    console.log('=== ADMIN PANEL DEBUG: Starting data load ===');
    console.log('Current localStorage keys:', Object.keys(localStorage));
    
    // Check what's in localStorage
    const registeredUsersRaw = localStorage.getItem('registeredUsers');
    console.log('Raw registeredUsers from localStorage:', registeredUsersRaw);
    
    try {
      // Try to get users directly from localStorage first
      let allUsers: UserAccount[] = [];
      
      if (registeredUsersRaw) {
        try {
          const parsedUsers = JSON.parse(registeredUsersRaw);
          console.log('Parsed users from localStorage:', parsedUsers);
          
          if (Array.isArray(parsedUsers)) {
            allUsers = parsedUsers;
            console.log('Successfully loaded users array:', allUsers.length, 'users');
          } else {
            console.log('registeredUsers is not an array:', typeof parsedUsers);
          }
        } catch (parseError) {
          console.error('Error parsing registeredUsers:', parseError);
        }
      } else {
        console.log('No registeredUsers found in localStorage');
      }
      
      // Also try authService method as backup
      const serviceUsers = authService.getAllUsers();
      console.log('Users from authService:', serviceUsers);
      
      // Use whichever method gives us more users
      if (serviceUsers.length > allUsers.length) {
        allUsers = serviceUsers;
        console.log('Using authService users instead');
      }
      
      console.log('Final users array:', allUsers);
      setUsers(allUsers);
      
      // Load deposits for these users
      loadDeposits(allUsers);
      
      console.log('=== ADMIN PANEL DEBUG: Data loading complete ===');
      console.log('Total users loaded:', allUsers.length);
      
    } catch (error) {
      console.error('Error in loadAllData:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load admin data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDeposits = (usersList: UserAccount[]) => {
    console.log('=== LOADING DEPOSITS ===');
    console.log('Loading deposits for users:', usersList.length);
    const allDeposits: DepositRecord[] = [];
    
    usersList.forEach(user => {
      console.log(`Checking deposits for user: ${user.email}`);
      
      // Check user data in localStorage directly
      const userDataKey = `userData_${user.email}`;
      const userDataRaw = localStorage.getItem(userDataKey);
      console.log(`Raw userData for ${user.email}:`, userDataRaw);
      
      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          console.log(`Parsed userData for ${user.email}:`, userData);
          
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
            console.log(`No deposits array found for ${user.email}`);
          }
        } catch (error) {
          console.error(`Error parsing userData for ${user.email}:`, error);
        }
      } else {
        console.log(`No userData found for ${user.email}`);
      }
    });
    
    console.log('Total deposits loaded:', allDeposits.length);
    console.log('All deposits:', allDeposits);
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

        {/* Enhanced Debug info */}
        <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
          <p><strong>🔍 Real-time Debug Info:</strong></p>
          <p>📊 Total Users Found: <span className="font-bold text-green-600">{users.length}</span></p>
          <p>💰 Total Deposits Found: <span className="font-bold text-blue-600">{deposits.length}</span></p>
          <p>🔄 Last Refresh: <span className="font-mono">{new Date().toLocaleTimeString()}</span></p>
          <p>💾 localStorage Keys: <span className="font-mono text-xs">{Object.keys(localStorage).filter(key => key.includes('user') || key.includes('registered')).join(', ')}</span></p>
          {users.length === 0 && (
            <p className="text-orange-600 mt-2">
              ⚠️ No users found. Register a new user to test the admin panel functionality.
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
