
export interface UserAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  createdAt: string;
}

export interface UserData {
  demoBalance: number;
  realBalance: number;
  accountType: 'demo' | 'real';
  recentMines: any[];
  profile: UserAccount;
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    twoFactorAuth: boolean;
    miningAlerts: boolean;
  };
  deposits: any[];
  withdrawals: any[];
  tradingHistory: any[];
}

class AuthService {
  private getCurrentUser(): string | null {
    return localStorage.getItem('currentUserEmail');
  }

  private getUserKey(email: string, key: string): string {
    return `user_${email}_${key}`;
  }

  registerUser(email: string, password: string): { success: boolean; message: string } {
    // Check if user already exists
    const existingUsers = this.getAllUsers();
    if (existingUsers.find(user => user.email === email)) {
      return { success: false, message: 'Account with this email already exists' };
    }

    // Create new user account
    const newUser: UserAccount = {
      email,
      password,
      firstName: '',
      lastName: '',
      phone: '',
      country: '',
      createdAt: new Date().toISOString()
    };

    // Initialize user data
    const initialUserData: UserData = {
      demoBalance: 10000,
      realBalance: 0,
      accountType: 'demo',
      recentMines: [],
      profile: newUser,
      settings: {
        emailNotifications: true,
        smsNotifications: false,
        twoFactorAuth: true,
        miningAlerts: true
      },
      deposits: [],
      withdrawals: [],
      tradingHistory: []
    };

    // Save user data
    this.saveUserData(email, initialUserData);
    
    // Add to users list
    const users = this.getAllUsers();
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    return { success: true, message: 'Account created successfully' };
  }

  loginUser(email: string, password: string, rememberMe: boolean = false): { success: boolean; message: string } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Set current user
    localStorage.setItem('currentUserEmail', email);
    
    // Save remember me preference
    if (rememberMe) {
      localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('rememberedUser');
    }

    return { success: true, message: 'Login successful' };
  }

  logoutUser(): void {
    localStorage.removeItem('currentUserEmail');
    // Don't remove rememberedUser - that should persist
  }

  getCurrentUserData(): UserData | null {
    const currentEmail = this.getCurrentUser();
    if (!currentEmail) return null;

    return this.getUserData(currentEmail);
  }

  getUserData(email: string): UserData | null {
    try {
      const userData = localStorage.getItem(this.getUserKey(email, 'data'));
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  saveUserData(email: string, data: UserData): void {
    localStorage.setItem(this.getUserKey(email, 'data'), JSON.stringify(data));
  }

  updateUserBalance(email: string, demoBalance: number, realBalance: number): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.demoBalance = demoBalance;
      userData.realBalance = realBalance;
      this.saveUserData(email, userData);
    }
  }

  addUserTransaction(email: string, transaction: any): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.recentMines = [transaction, ...userData.recentMines.slice(0, 9)];
      this.saveUserData(email, userData);
    }
  }

  addUserDeposit(email: string, deposit: any): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.deposits = [deposit, ...userData.deposits];
      this.saveUserData(email, userData);
    }
  }

  addUserWithdrawal(email: string, withdrawal: any): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.withdrawals = [withdrawal, ...userData.withdrawals];
      this.saveUserData(email, userData);
    }
  }

  updateUserAccountType(email: string, accountType: 'demo' | 'real'): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.accountType = accountType;
      this.saveUserData(email, userData);
    }
  }

  updateUserProfile(email: string, profile: Partial<UserAccount>): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.profile = { ...userData.profile, ...profile };
      this.saveUserData(email, userData);
    }
  }

  updateUserSettings(email: string, settings: any): void {
    const userData = this.getUserData(email);
    if (userData) {
      userData.settings = { ...userData.settings, ...settings };
      this.saveUserData(email, userData);
    }
  }

  getAllUsers(): UserAccount[] {
    try {
      const users = localStorage.getItem('registeredUsers');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  deleteUser(email: string): boolean {
    try {
      // Remove from users list
      const users = this.getAllUsers();
      const updatedUsers = users.filter(user => user.email !== email);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Remove user data
      localStorage.removeItem(this.getUserKey(email, 'data'));
      
      // If this is the current user, log them out
      if (this.getCurrentUser() === email) {
        this.logoutUser();
      }
      
      return true;
    } catch {
      return false;
    }
  }

  getRememberedUser(): { email: string; password: string } | null {
    try {
      const remembered = localStorage.getItem('rememberedUser');
      return remembered ? JSON.parse(remembered) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getCurrentUserEmail(): string | null {
    return this.getCurrentUser();
  }
}

export const authService = new AuthService();
