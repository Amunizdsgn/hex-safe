"use client"

import { SlidersHorizontal } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { formatPercent } from '@/data/mockData';

export function ScenarioSensitivity({
    pendingRate,
    expenseRate,
    onPendingChange,
    onExpenseChange
}) {
    return (
        <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                Sensibilidade de Cenários
            </h3>

            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Recebimento de Pendências</label>
                        <span className="text-sm font-bold text-primary">{formatPercent(pendingRate)}</span>
                    </div>
                    <Slider
                        defaultValue={[pendingRate]}
                        max={100}
                        step={5}
                        onValueChange={(val) => onPendingChange(val[0])}
                    />
                    <p className="text-xs text-muted-foreground">Impacta o cenário realista e pessimista.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Pagamento de Despesas</label>
                        <span className="text-sm font-bold text-destructive">{formatPercent(expenseRate)}</span>
                    </div>
                    <Slider
                        defaultValue={[expenseRate]}
                        max={100}
                        step={5}
                        onValueChange={(val) => onExpenseChange(val[0])}
                    />
                    <p className="text-xs text-muted-foreground">Considera economia ou gastos extras.</p>
                </div>
            </div>
        </div>
    );
}
