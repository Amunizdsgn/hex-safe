"use client"

import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatPercent, pendingItems } from '@/data/mockData';

export function ClosingRisk({ pendingRevenue, totalProjectedRevenue }) {
    // Calculate risk based on high-risk pending items
    const highRiskValue = pendingItems
        .filter(item => item.risk === 'Alto' && item.type === 'receita')
        .reduce((sum, item) => sum + item.value, 0);

    const riskPercentage = totalProjectedRevenue > 0 ? (highRiskValue / totalProjectedRevenue) * 100 : 0;

    let riskLevel = 'Baixo';
    let riskColor = 'text-success';
    let Icon = CheckCircle2;
    let bgColor = 'bg-success/10';
    let borderColor = 'border-success/20';

    if (riskPercentage > 15) {
        riskLevel = 'Alto';
        riskColor = 'text-destructive';
        Icon = ShieldAlert;
        bgColor = 'bg-destructive/10';
        borderColor = 'border-destructive/20';
    } else if (riskPercentage > 5) {
        riskLevel = 'Médio';
        riskColor = 'text-warning';
        Icon = AlertTriangle;
        bgColor = 'bg-warning/10';
        borderColor = 'border-warning/20';
    }

    return (
        <div className={`glass-card rounded-xl p-6 border ${borderColor} ${bgColor}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Risco do Fechamento</h3>
                    <p className="text-sm text-muted-foreground">Exposição a inadimplência</p>
                </div>
                <div className={`p-2 rounded-lg bg-background/50 ${riskColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="mt-4">
                <p className={`text-2xl font-bold ${riskColor} mb-2`}>{riskLevel}</p>
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{formatPercent(riskPercentage)}</span> da receita projetada depende de pagamentos com alto risco de atraso.
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-border/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    <span>{pendingItems.filter(i => i.risk === 'Alto' && i.type === 'receita').length} pendências críticas</span>
                </div>
            </div>
        </div>
    );
}
