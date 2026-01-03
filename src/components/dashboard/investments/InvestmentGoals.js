"use client"

import { Target } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { Progress } from "@/components/ui/progress";

export function InvestmentGoals({ currentAmount, goalAmount = 150000 }) {
    const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
    const remaining = Math.max(goalAmount - currentAmount, 0);

    return (
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-24 h-24 text-primary" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Meta de Patrimônio
                    </h3>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {formatPercent(percentage)} Atingido
                    </span>
                </div>

                <div className="mb-4">
                    <p className="text-3xl font-bold kpi-value mb-1">{formatCurrency(currentAmount)}</p>
                    <p className="text-sm text-muted-foreground">de {formatCurrency(goalAmount)} <span className="text-xs ml-1">(Faltam {formatCurrency(remaining)})</span></p>
                </div>

                <Progress value={percentage} className="h-3 bg-secondary" indicatorClassName="bg-primary/80" />

                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between">
                    <span>Início: Jan 2024</span>
                    <span>Projeção: Dez 2025</span>
                </div>
            </div>
        </div>
    );
}
