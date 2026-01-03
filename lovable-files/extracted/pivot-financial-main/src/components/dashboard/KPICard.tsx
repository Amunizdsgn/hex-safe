import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'highlight';
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  className,
}: KPICardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  
  const variantStyles = {
    default: 'border-border/50',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    danger: 'border-destructive/30 bg-destructive/5',
    highlight: 'border-primary/30 bg-primary/5 glow-primary',
  };

  const trendColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  const trendColor = trend && trend > 0 ? trendColors.positive : trend && trend < 0 ? trendColors.negative : trendColors.neutral;

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 transition-all duration-300 hover:border-primary/30 animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold kpi-value tracking-tight">{value}</p>
        
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
                <TrendIcon className="w-3 h-3" />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
            {trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
            {subtitle && !trendLabel && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
