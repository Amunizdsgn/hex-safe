"use client"

import { useState } from 'react';
import { FlaskConical, Play, Pause, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, channelExperiments as initialExperiments } from '@/data/mockData';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ExperimentMode() {
    const [experiments, setExperiments] = useState(initialExperiments);
    const [isOpen, setIsOpen] = useState(false);

    const handleCreateExperiment = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const newExp = {
            id: Date.now(),
            channelId: 99, // Mock ID
            name: formData.get('name'),
            budget: parseFloat(formData.get('budget')),
            spent: 0,
            startDate: new Date().toISOString(),
            endDate: formData.get('endDate'),
            metric: formData.get('metric'),
            target: parseFloat(formData.get('target')),
            current: 0
        };

        setExperiments([...experiments, newExp]);
        setIsOpen(false);
    };

    const handleDelete = (id) => {
        setExperiments(experiments.filter(e => e.id !== id));
    };

    return (
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-secondary/5 to-purple-500/5 border-l-4 border-l-purple-500">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                        <FlaskConical className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Modo Experimento</h3>
                        <p className="text-sm text-muted-foreground">Testes A/B e novos canais</p>
                    </div>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10">
                            + Novo Teste
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] glass-card border-border/50 text-foreground">
                        <DialogHeader>
                            <DialogTitle>Novo Experimento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateExperiment} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Campanha</Label>
                                <Input id="name" name="name" placeholder="Ex: TikTok Ads Q1" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Orçamento (R$)</Label>
                                    <Input id="budget" name="budget" type="number" placeholder="5000" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Data Fim</Label>
                                    <Input id="endDate" name="endDate" type="date" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="metric">Métrica Principal</Label>
                                    <Input id="metric" name="metric" placeholder="Leads" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target">Meta (Qtd)</Label>
                                    <Input id="target" name="target" type="number" placeholder="100" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">Iniciar Teste</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {experiments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum experimento ativo no momento.</p>
                ) : experiments.map((exp) => {
                    const progress = (exp.spent / exp.budget) * 100;
                    const resultPercent = (exp.current / exp.target) * 100;

                    return (
                        <div key={exp.id} className="p-4 bg-background/40 rounded-xl border border-border/50 group relative">
                            <button
                                onClick={() => handleDelete(exp.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex justify-between items-start mb-3 pr-6">
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">{exp.name}</h4>
                                    <p className="text-xs text-muted-foreground">Termina em {new Date(exp.endDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(exp.spent)}</p>
                                    <p className="text-xs text-muted-foreground">de {formatCurrency(exp.budget)}</p>
                                </div>
                            </div>

                            <Progress value={progress} className="h-1.5 mb-2 bg-purple-900/20" indicatorClassName="bg-purple-500" />

                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
                                <div className="text-xs">
                                    <span className="text-muted-foreground">Meta: </span>
                                    <span className={`font-medium ${resultPercent >= 50 ? 'text-success' : 'text-warning'}`}>
                                        {exp.current} / {exp.target} {exp.metric}
                                    </span>
                                </div>
                                {resultPercent >= 40 ? (
                                    <span className="text-xs font-bold text-success flex items-center gap-1">
                                        <Play className="w-3 h-3 fill-current" />
                                        ESCALAR
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                        <Pause className="w-3 h-3 fill-current" />
                                        AVALIAR
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
