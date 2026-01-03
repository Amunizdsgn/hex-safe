"use client"

import { Divide, TrendingUp, Percent } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';

export function EfficiencyIndicators({ avgTicket, margin }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 flex flex-col justify-between hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Divide className="w-4 h-4" />
                    <span className="text-sm">Ticket Médio Real</span>
                </div>
                <div>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(avgTicket)}</p>
                    <p className="text-xs text-muted-foreground mt-1">vs {formatCurrency(avgTicket * 0.9)} (Mês anterior)</p>
                </div>
            </div>

            <div className="glass-card rounded-xl p-4 flex flex-col justify-between hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Conversão de Propostas</span>
                </div>
                <div>
                    <p className="text-xl font-bold text-success">32.5%</p>
                    <p className="text-xs text-muted-foreground mt-1">Meta: 30%</p>
                </div>
            </div>

            <div className="glass-card rounded-xl p-4 flex flex-col justify-between hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Percent className="w-4 h-4" />
                    <span className="text-sm">Margem Operacional</span>
                </div>
                <div>
                    <p className={`text-xl font-bold ${margin > 50 ? 'text-success' : 'text-warning'}`}>{formatPercent(margin)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Saudável &gt; 50%</p>
                </div>
            </div>
        </div>
    );
}
