'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddAlertFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAlertForm({ isOpen, onClose }: AddAlertFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: API call to create alert
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="
        fixed inset-0 bg-black/50 backdrop-blur-sm
        flex items-center justify-center z-50
        animate-fade-in
      "
      onClick={handleOverlayClick}
    >
      <Card className="
        w-full max-w-md p-6
        animate-slide-up
        shadow-[0_0_50px_rgba(59,130,246,0.3)]
      ">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create New Alert
          </h2>
          <button
            onClick={onClose}
            className="
              p-1 hover:bg-muted rounded-md
              transition-colors duration-200
            "
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Asset
            </label>
            <select className="
              w-full bg-muted/50 backdrop-blur-sm
              border border-border rounded-md px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-primary/50
              transition-all duration-200
            ">
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="BBAI">BigBear.ai (BBAI)</option>
            </select>
          </div>

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Alert Type
            </label>
            <select className="
              w-full bg-muted/50 backdrop-blur-sm
              border border-border rounded-md px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-primary/50
              transition-all duration-200
            ">
              <option value="high">Price Above (High)</option>
              <option value="low">Price Below (Low)</option>
            </select>
          </div>

          {/* Threshold Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Threshold Price
            </label>
            <Input
              type="number"
              placeholder="e.g., 50000"
              className="
                focus:ring-2 focus:ring-primary/50
                transition-all duration-200
              "
              required
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Currency
            </label>
            <select className="
              w-full bg-muted/50 backdrop-blur-sm
              border border-border rounded-md px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-primary/50
              transition-all duration-200
            ">
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Alert'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
