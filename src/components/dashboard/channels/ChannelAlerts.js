"use client"

import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';

export function ChannelAlerts({ channels }) {
    const alerts = [];

    channels.forEach(channel => {
        if (channel.roi < 0 && channel.custo > 0) {
            alerts.push({
                type: 'critical',
                icon: AlertTriangle,
                title: 'ROI Negativo',
                message: `${channel.canal} está consumindo caixa sem retorno (${formatPercent(channel.roi)}).`,
                color: 'text-destructive',
                bgColor: 'bg-destructive/10'
            });
        }
        if (channel.cac > channel.ltv && channel.ltv > 0) {
            alerts.push({
                type: 'warning',
                icon: Wallet,
                title: 'CAC Elevado',
                message: `${channel.canal}: Custo de aquisição acima do LTV (${formatCurrency(channel.cac)}).`,
                color: 'text-warning',
                bgColor: 'bg-warning/10'
            });
        }
        if (channel.crescimento < -10) {
            alerts.push({
                type: 'warning',
                icon: TrendingDown,
                title: 'Queda de Performance',
                message: `Queda acentuada em ${channel.canal} (${formatPercent(Math.abs(channel.crescimento))}).`,
                color: 'text-warning',
                bgColor: 'bg-warning/10'
            });
        }
    });

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Alertas de Performance</h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-destructive text-destructive-foreground animate-pulse">
                    {alerts.length} alertas
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {alerts.map((alert, index) => {
                    const Icon = alert.icon;
                    return (
                        <div key={index} className={`flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-border/50 transition-colors ${alert.bgColor}`}>
                            <div className={`p-2 rounded-full bg-background/50 ${alert.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className={`font-medium text-sm mb-0.5 ${alert.color}`}>{alert.title}</h4>
                                <p className="text-xs text-muted-foreground">{alert.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
