'use client';

import { useState } from 'react';
import { AlertList } from '@/components/features/alert-list';
import { AlertHistory } from '@/components/features/alert-history';
import { AddAlertForm } from '@/components/features/add-alert-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AlertsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Set price alerts for your assets
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          New Alert
        </Button>
      </div>

      {/* Active Alerts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
          Active Alerts
        </h2>
        <AlertList />
      </div>

      {/* Alert History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
          Recent Triggers
        </h2>
        <AlertHistory />
      </div>

      {/* Add Alert Modal */}
      <AddAlertForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
