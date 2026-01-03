"use client"

import { Users, Clock, DollarSign, Target } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';

export function AdvancedChannelMetrics({ channels }) {
    // Calculate global metrics
    const totalCost = channels.reduce((sum, c) => sum + c.custo, 0);
    const totalClients = channels.reduce((sum, c) => sum + c.clientes, 0);
    const totalRevenue = channels.reduce((sum, c) => sum + c.receita, 0);

    // Weighted averages
    const avgCAC = totalClients > 0 ? totalCost / totalClients : 0;
    const avgLTV = channels.reduce((sum, c) => sum + (c.ltv * c.clientes), 0) / totalClients;
    const avgConversion = channels.reduce((sum, c) => sum + (c.conversionRate * c.receita), 0) / totalRevenue; // Weighted by revenue

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">CAC Médio</p>
                    <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold kpi-value">{formatCurrency(avgCAC)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Meta: {formatCurrency(avgCAC * 0.9)}
                </p>
            </div>

            <div className="glass-card rounded-xl p-5 border-l-4 border-l-success">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">LTV Médio</p>
                    <DollarSign className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold kpi-value">{formatCurrency(avgLTV)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    LTV/CAC: {(avgLTV / avgCAC).toFixed(1)}x
                </p>
            </div>

            <div className="glass-card rounded-xl p-5 border-l-4 border-l-warning">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">Conversão Global</p>
                    <Target className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-bold kpi-value">{formatPercent(avgConversion)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    vs {formatPercent(avgConversion - 2)} (Mês ant.)
                </p>
            </div>

            <div className="glass-card rounded-xl p-5 border-l-4 border-l-muted">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-muted-foreground">Tempo Fechamento</p>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold kpi-value">18 dias</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Redução de -2 dias
                </p>
            </div>
        </div>
    );
}
