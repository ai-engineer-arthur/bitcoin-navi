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
      {/* New Alert Button */}
      <div className="flex justify-end">
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
