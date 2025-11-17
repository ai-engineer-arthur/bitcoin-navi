'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { TrendingUp, TrendingDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const mockAlerts = [
  {
    id: '1',
    assetSymbol: 'BTC',
    assetName: 'Bitcoin',
    type: 'high' as const,
    threshold: 50000,
    currency: 'USD',
    isActive: true,
  },
  {
    id: '2',
    assetSymbol: 'BBAI',
    assetName: 'BigBear.ai',
    type: 'low' as const,
    threshold: 10,
    currency: 'USD',
    isActive: false,
  },
];

export function AlertList() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleToggle = (id: string, newState: boolean) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: newState } : alert
    ));
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Card
          key={alert.id}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Alert Type Icon */}
            <div className={`
              p-3 rounded-full relative group
              ${alert.type === 'high'
                ? 'bg-gradient-to-br from-primary/20 to-accent/20'
                : 'bg-gradient-to-br from-accent-pink/20 to-accent-pink/10'
              }
            `}>
              {alert.type === 'high' ? (
                <TrendingUp className="text-primary relative z-10" size={20} />
              ) : (
                <TrendingDown className="text-accent-pink relative z-10" size={20} />
              )}
              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-full blur-md
                opacity-0 group-hover:opacity-30 transition-opacity duration-300
                ${alert.type === 'high'
                  ? 'bg-gradient-to-r from-primary to-accent'
                  : 'bg-accent-pink'
                }
              `} />
            </div>

            {/* Alert Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {alert.assetSymbol} {alert.type === 'high' ? 'above' : 'below'} ${alert.threshold.toLocaleString()}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {alert.assetName} • {alert.currency}
              </p>
            </div>

            {/* Toggle Switch */}
            <Toggle
              isActive={alert.isActive}
              onChange={(newState) => handleToggle(alert.id, newState)}
            />

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => toggleMenu(alert.id)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="More options"
              >
                <MoreVertical size={20} />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === alert.id && (
                <div className="
                  absolute right-0 mt-2 w-48
                  bg-card/95 backdrop-blur-xl
                  border border-border rounded-lg
                  shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                  z-10 overflow-hidden
                  animate-fade-in
                ">
                  <button className="
                    w-full px-4 py-2 text-left text-sm
                    hover:bg-muted transition-colors
                    flex items-center gap-2
                  ">
                    <Edit2 size={16} />
                    Edit Alert
                  </button>
                  <button className="
                    w-full px-4 py-2 text-left text-sm
                    text-red-500 hover:bg-red-500/10 transition-colors
                    flex items-center gap-2
                  ">
                    <Trash2 size={16} />
                    Delete Alert
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
