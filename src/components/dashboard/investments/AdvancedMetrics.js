"use client"

import { Activity, BarChart2, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';

export function AdvancedMetrics() {
    // Mock calculations for demo
    const drawdown = -4.2;
    const volatility = 8.5;
    const monthlyPassive = 1250;
    const annualPassive = 15000;

    const metrics = [
        {
            label: 'Drawdown Máximo',
            value: formatPercent(drawdown),
            sub: 'Últimos 12 meses',
            icon: TrendingDown,
            color: 'text-destructive',
            bg: 'bg-destructive/10'
        },
        {
            label: 'Volatilidade (12m)',
            value: formatPercent(volatility),
            sub: 'Desvio Padrão',
            icon: Activity,
            color: 'text-warning',
            bg: 'bg-warning/10'
        },
        {
            label: 'Renda Passiva Mensal',
            value: formatCurrency(monthlyPassive),
            sub: 'Média estimada',
            icon: DollarSign,
            color: 'text-success',
            bg: 'bg-success/10'
        },
        {
            label: 'Renda Passiva Anual',
            value: formatCurrency(annualPassive),
            sub: 'Projeção',
            icon: BarChart2,
            color: 'text-primary',
            bg: 'bg-primary/10'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => {
                const Icon = m.icon;
                return (
                    <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${m.bg} ${m.color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{m.label}</p>
                            <p className="text-lg font-bold text-foreground">{m.value}</p>
                            <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
