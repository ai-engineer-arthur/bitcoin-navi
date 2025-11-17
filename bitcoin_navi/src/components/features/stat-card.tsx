import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  note?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  note,
}: StatCardProps) {
  return (
    <Card className="glass-strong hover:scale-105 transition-all duration-300 group border border-transparent hover:border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground-muted">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-primary' : 'text-accent-pink'
            }`}
          >
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {change}
          </div>
        )}
        {note && (
          <div className="text-xs text-foreground-muted mt-2">{note}</div>
        )}
      </CardContent>
    </Card>
  );
}
