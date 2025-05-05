
import React, { useState } from 'react';
import { Button } from './ui/button';
import { migrateMockData } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { RefreshCcw } from 'lucide-react';

const AdminControls = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleForceMigration = async () => {
    setIsMigrating(true);
    try {
      await migrateMockData(true); // Force update
      toast({
        title: 'Migration successful',
        description: 'All mock data has been migrated to the database.',
      });
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: 'Migration failed',
        description: 'There was an error migrating the mock data.',
        variant: 'destructive',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleForceMigration}
        variant="outline"
        size="sm"
        className="bg-white shadow-md text-xs flex items-center gap-1 opacity-70 hover:opacity-100"
        disabled={isMigrating}
      >
        <RefreshCcw className="h-3 w-3" />
        {isMigrating ? 'Migrating...' : 'Remigrate Data'}
      </Button>
    </div>
  );
};

export default AdminControls;
