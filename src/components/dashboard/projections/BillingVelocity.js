"use client"

import { Gauge, Clock, CalendarDays } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { Progress } from "@/components/ui/progress";

export function BillingVelocity({ currentRevenue, monthlyGoal, workingDays = 22, daysPassed }) {
    // Calculate velocity
    const dialyAverage = daysPassed > 0 ? currentRevenue / daysPassed : 0;
    const requiredDaily = (monthlyGoal - currentRevenue) / (workingDays - daysPassed);
    const velocityRatio = dialyAverage / (monthlyGoal / workingDays);

    // Determine status
    let status = 'No Ritmo';
    let statusColor = 'text-warning';

    if (velocityRatio > 1.1) {
        status = 'Adiantado';
        statusColor = 'text-success';
    } else if (velocityRatio < 0.9) {
        status = 'Atrasado';
        statusColor = 'text-destructive';
    }

    return (
        <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Velocidade de Faturamento
            </h3>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-muted-foreground">Status Atual</p>
                    <p className={`text-2xl font-bold ${statusColor}`}>{status}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Média Diária</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(dialyAverage)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Meta Diária Ideal</p>
                        <p className="font-semibold text-foreground">{formatCurrency(monthlyGoal / workingDays)}</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                </div>

                {daysPassed < workingDays && (
                    <div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Necessário p/ Bater Meta</p>
                            <p className="font-semibold text-warning">{formatCurrency(Math.max(requiredDaily, 0))}/dia</p>
                        </div>
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progresso Temporal</span>
                    <span>{(daysPassed / workingDays * 100).toFixed(0)}% do mês</span>
                </div>
                <Progress value={(daysPassed / workingDays) * 100} className="h-1.5" />
            </div>
        </div>
    );
}
