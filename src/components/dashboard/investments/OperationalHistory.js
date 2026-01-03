"use client"

import { useState } from 'react';
import { History, PlusCircle, Calculator } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function OperationalHistory({ history }) {
    const [simValue, setSimValue] = useState('');
    const [simAsset, setSimAsset] = useState('');
    const [simulationResult, setSimulationResult] = useState(null);

    const handleSimulate = () => {
        if (!simValue) return;
        // Mock simulation logic
        const val = parseFloat(simValue);
        const projectedReturn = val * 0.12; // 12% a.a mock
        setSimulationResult({
            amount: val,
            projected: val + projectedReturn,
            monthly: (val * 0.01) // 1% a.m mock
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Histórico de Operações
                </h3>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary">
                            <Calculator className="w-4 h-4" />
                            Simular Aporte
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
                        <DialogHeader>
                            <DialogTitle>Simular Novo Aporte</DialogTitle>
                            <DialogDescription>
                                Veja o impacto projetado de um novo investimento no seu portfólio.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid items-center gap-2">
                                <Label htmlFor="asset-name">Nome do Ativo (Simulado)</Label>
                                <Input
                                    id="asset-name"
                                    placeholder="Ex: FII HGLG11"
                                    value={simAsset}
                                    onChange={(e) => setSimAsset(e.target.value)}
                                />
                            </div>
                            <div className="grid items-center gap-2">
                                <Label htmlFor="amount">Valor do Aporte (R$)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0,00"
                                    value={simValue}
                                    onChange={(e) => setSimValue(e.target.value)}
                                />
                            </div>

                            {simulationResult && (
                                <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Projeção (12 meses):</span>
                                        <span className="font-bold text-success">{formatCurrency(simulationResult.projected)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Renda Mensal Est.:</span>
                                        <span className="font-bold text-success">+{formatCurrency(simulationResult.monthly)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center mt-2 pt-2 border-t border-border/30">
                                        *Cálculos baseados em rentabilidade média estimada de 12% a.a.
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button onClick={handleSimulate} className="w-full gradient-primary">Calcular Projeção</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Operação</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ativo</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {history.map((op) => (
                            <tr key={op.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-4 py-3 text-muted-foreground">{new Date(op.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        op.type === 'Aporte' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                    )}>
                                        {op.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-foreground">{op.asset}</td>
                                <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(op.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
