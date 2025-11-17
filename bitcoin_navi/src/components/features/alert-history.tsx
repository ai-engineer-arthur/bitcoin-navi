import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const mockHistory = [
  {
    id: '1',
    assetSymbol: 'BTC',
    message: 'Bitcoin price reached $50,000',
    triggeredAt: '2 hours ago',
  },
  {
    id: '2',
    assetSymbol: 'BBAI',
    message: 'BigBear.ai dropped below $10',
    triggeredAt: '1 day ago',
  },
];

export function AlertHistory() {
  return (
    <Card>
      <div className="space-y-3">
        {mockHistory.map((item, index) => (
          <div
            key={item.id}
            className="
              flex items-start gap-3 p-3
              bg-gradient-to-r from-muted/50 to-transparent
              rounded-lg border border-border/50
              hover:border-primary/30 transition-all duration-300
              animate-fade-in
            "
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="
              p-2 bg-gradient-to-br from-primary/20 to-accent/20
              rounded-full relative group
            ">
              <Bell className="text-primary relative z-10" size={16} />
              {/* Glow effect */}
              <div className="
                absolute inset-0 rounded-full
                bg-gradient-to-r from-primary to-accent
                opacity-0 group-hover:opacity-20
                blur-md transition-opacity duration-300
              " />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.message}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.triggeredAt}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
