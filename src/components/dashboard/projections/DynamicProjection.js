"use client"

import { ToggleLeft, ToggleRight, PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from '@/data/mockData';

export function DynamicProjection({
    baseRevenue,
    simulatedRevenue,
    onToggleProject,
    onTogglePendings,
    simulatedExtras
}) {
    return (
        <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Simulador Dinâmico
            </h3>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="sim-project" className="text-base">Simular +1 Projeto Médio</Label>
                        <p className="text-xs text-muted-foreground">Adiciona R$ 15k na projeção</p>
                    </div>
                    <Switch
                        id="sim-project"
                        checked={simulatedExtras.project}
                        onCheckedChange={onToggleProject}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="sim-pending" className="text-base">Considerar 100% Pendências</Label>
                        <p className="text-xs text-muted-foreground">O padrão é 80% (Cenário Realista)</p>
                    </div>
                    <Switch
                        id="sim-pending"
                        checked={simulatedExtras.allPendings}
                        onCheckedChange={onTogglePendings}
                    />
                </div>

                <div className="p-4 bg-secondary/50 rounded-lg border border-border mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Base (Realista)</span>
                        <span className="font-medium">{formatCurrency(baseRevenue)}</span>
                    </div>
                    {simulatedRevenue > baseRevenue && (
                        <div className="flex justify-between items-center text-success mb-2">
                            <span className="text-sm">+ Simulação</span>
                            <span className="font-bold">+{formatCurrency(simulatedRevenue - baseRevenue)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-sm font-semibold text-foreground">Projeção Final</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(simulatedRevenue)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
