"use client"

import { AlertTriangle, TrendingDown, Calendar, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPercent, formatCurrency } from '@/data/mockData';

export function InvestmentAlerts({ investments }) {
    const alerts = [];

    // Analyze investments for alerts
    investments.forEach(inv => {
        // Negative Return
        if (inv.rentabilidadePercentual < 0) {
            alerts.push({
                type: 'warning',
                icon: TrendingDown,
                title: 'Rentabilidade Negativa',
                message: `${inv.ativo} está com rentabilidade de ${formatPercent(inv.rentabilidadePercentual)}.`,
                color: 'text-destructive',
                bgColor: 'bg-destructive/10',
                borderColor: 'border-destructive/20'
            });
        }
    });

    // Concentration Check
    const totalValue = investments.reduce((sum, i) => sum + i.valorAtual, 0);
    investments.forEach(inv => {
        const concentration = (inv.valorAtual / totalValue) * 100;
        if (concentration > 35) {
            alerts.push({
                type: 'info',
                icon: PieChart,
                title: 'Alta Concentração',
                message: `${inv.ativo} representa ${formatPercent(concentration)} do seu portfólio.`,
                color: 'text-highlight',
                bgColor: 'bg-highlight/10',
                borderColor: 'border-highlight/20'
            });
        }
    });

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Alertas de Portfólio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alerts.map((alert, index) => {
                    const Icon = alert.icon;
                    return (
                        <div key={index} className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02]",
                            alert.bgColor,
                            alert.borderColor
                        )}>
                            <div className={cn("p-2 rounded-full bg-background/50", alert.color)}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={cn("font-medium text-sm mb-1", alert.color)}>{alert.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
