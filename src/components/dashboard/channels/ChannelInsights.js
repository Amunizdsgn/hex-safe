"use client"

import { Lightbulb, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';

export function ChannelInsights({ channels = [] }) {
    // Generate insights dynamically based on channel data
    const insights = [];

    channels.forEach(channel => {
        // High ROI Insight
        if (channel.roi > 1000 && channel.status !== 'Escalado') {
            insights.push({
                id: `scale-${channel.id}`,
                type: 'growth',
                title: `Escalar ${channel.canal}`,
                message: `ROI de ${formatPercent(channel.roi)} justifica aumento de verba.`,
                icon: TrendingUp,
                color: 'text-success',
                bg: 'hover:border-success/40'
            });
        }

        // High CAC Insight
        if (channel.cac > 2000 && channel.receita > 0) {
            insights.push({
                id: `review-${channel.id}`,
                type: 'warning',
                title: `Revisar ${channel.canal}`,
                message: `CAC (${formatCurrency(channel.cac)}) está acima da média de mercado.`,
                icon: AlertTriangle,
                color: 'text-warning',
                bg: 'hover:border-warning/40'
            });
        }

        // Low Conversion Insight
        if (channel.conversionRate > 0 && channel.conversionRate < 2 && channel.type === 'Pago') {
            insights.push({
                id: `opt-${channel.id}`,
                type: 'optimization',
                title: `Otimizar ${channel.canal}`,
                message: `Taxa de conversão de ${formatPercent(channel.conversionRate)} pode ser melhorada.`,
                icon: Lightbulb,
                color: 'text-primary',
                bg: 'hover:border-primary/40'
            });
        }
    });

    // Fallback if no specific insights
    if (insights.length === 0) {
        insights.push({
            id: 'default',
            title: 'Mantenha o bom trabalho',
            message: 'Seus canais estão performando dentro do esperado.',
            icon: Lightbulb,
            color: 'text-muted-foreground',
            bg: ''
        });
    }

    return (
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Growth Insights
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {insights.slice(0, 4).map((insight) => {
                    const Icon = insight.icon;
                    return (
                        <div key={insight.id} className={`p-3 bg-background/60 rounded-lg flex justify-between items-center border border-border/50 transition-all cursor-pointer group ${insight.bg}`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-1.5 rounded-md bg-background/80 ${insight.color}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{insight.title}</p>
                                    <p className="text-xs text-muted-foreground">{insight.message}</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform opacity-50 group-hover:opacity-100" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
