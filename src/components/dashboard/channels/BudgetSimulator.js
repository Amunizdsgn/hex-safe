"use client"

import { useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatPercent } from '@/data/mockData';

export function BudgetSimulator({ channels }) {
    const [distributions, setDistributions] = useState(
        channels.map(c => ({ id: c.id, name: c.canal, weight: 100 }))
    );

    // Simplistic simulation logic
    const totalCurrentBudget = channels.reduce((sum, c) => sum + c.custo, 0);
    const totalCurrentRevenue = channels.reduce((sum, c) => sum + c.receita, 0);
    const currentGlobalROI = (totalCurrentRevenue - totalCurrentBudget) / totalCurrentBudget;

    const simulatedBudget = totalCurrentBudget; // Keeping total budget constant for simplicity

    // Derived values
    const totalWeight = distributions.reduce((sum, d) => sum + d.weight, 0);

    const simulatedRevenue = distributions.reduce((sum, d) => {
        const channel = channels.find(c => c.id === d.id);
        const newBudgetShare = (d.weight / totalWeight) * simulatedBudget;
        // Simple elasticity model: +10% budget = +8% revenue (diminishing returns)
        const budgetRatio = channel.custo > 0 ? newBudgetShare / channel.custo : 1;
        const elasticity = 0.8;
        const revenueMultiplier = 1 + ((budgetRatio - 1) * elasticity);

        return sum + (channel.receita * revenueMultiplier);
    }, 0);

    const simulatedROI = (simulatedRevenue - simulatedBudget) / simulatedBudget;
    const impact = simulatedRevenue - totalCurrentRevenue;

    const handleSliderChange = (id, val) => {
        setDistributions(prev => prev.map(d => d.id === id ? { ...d, weight: val[0] } : d));
    };

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Simulador de Orçamento</h3>
                    <p className="text-sm text-muted-foreground">Redistribuição de Verba</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border/50">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Impacto na Receita</p>
                        <p className={`text-xl font-bold ${impact >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {impact >= 0 ? '+' : ''}{formatCurrency(impact)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">ROI Projetado</p>
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-xs line-through text-muted-foreground">{formatPercent(currentGlobalROI * 100)}</span>
                            <span className={`text-xl font-bold ${simulatedROI >= currentGlobalROI ? 'text-success' : 'text-warning'}`}>
                                {formatPercent(simulatedROI * 100)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {distributions.map(dist => {
                        const channel = channels.find(c => c.id === dist.id);
                        if (!channel) return null;
                        return (
                            <div key={dist.id} className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium">{dist.name}</span>
                                    <span className="text-muted-foreground">Peso: {dist.weight}</span>
                                </div>
                                <Slider
                                    defaultValue={[100]}
                                    min={0}
                                    max={200}
                                    step={10}
                                    onValueChange={(val) => handleSliderChange(dist.id, val)}
                                />
                            </div>
                        )
                    })}
                </div>

                <div className="pt-2 flex justify-center">
                    <button onClick={() => setDistributions(channels.map(c => ({ id: c.id, name: c.canal, weight: 100 })))} className="text-xs text-primary flex items-center gap-1 hover:underline">
                        <RefreshCw className="w-3 h-3" /> Resetar Simulação
                    </button>
                </div>
            </div>
        </div>
    );
}
