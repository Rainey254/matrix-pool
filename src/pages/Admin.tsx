
import React, { useState, useEffect } from 'react';
import AdminPanel from '@/components/admin/AdminPanel';
import AdminAuth from '@/components/admin/AdminAuth';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm hover:bg-destructive/90"
        >
          Logout Admin
        </button>
      </div>
      <AdminPanel />
    </div>
  );
};

export default Admin;
