
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLink = () => {
  return (
    <Link to="/admin-panel">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Shield className="h-4 w-4 mr-2" />
        Admin
      </Button>
    </Link>
  );
};

export default AdminLink;
