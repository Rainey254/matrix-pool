
import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, Eye, EyeOff } from "lucide-react";

interface AdminHeaderProps {
  showPasswords: boolean;
  onTogglePasswords: () => void;
  onRefresh: () => void;
}

const AdminHeader = ({ showPasswords, onTogglePasswords, onRefresh }: AdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onTogglePasswords} 
          variant="outline"
          className="flex items-center gap-2"
        >
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPasswords ? 'Hide' : 'Show'} Passwords
        </Button>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
