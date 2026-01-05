"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Droplets, Settings, Minus, Plus } from 'lucide-react';

export function WaterTracker({ current, goal, onAdd, onUpdateGoal }) {
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [isCustomAddOpen, setIsCustomAddOpen] = useState(false);
    const [tempGoal, setTempGoal] = useState(goal);
    const [customAmount, setCustomAmount] = useState('');

    const percentage = Math.min(100, (current / goal) * 100);

    const handleSaveGoal = () => {
        onUpdateGoal(Number(tempGoal));
        setIsGoalDialogOpen(false);
    };

    const handleCustomAdd = () => {
        const amount = Number(customAmount);
        if (amount > 0) {
            onAdd(amount);
            setCustomAmount('');
            setIsCustomAddOpen(false);
        }
    };

    return (
        <div className="glass-card p-6 rounded-xl border border-blue-500/20 bg-gradient-to-br from-background to-blue-500/5 relative overflow-hidden shadow-lg">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
                <Droplets className="w-48 h-48 text-blue-500" />
            </div>

            <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Hidratação</h3>
                            <p className="text-xs text-muted-foreground">Meta diária: {goal / 1000}L</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                        onClick={() => { setTempGoal(goal); setIsGoalDialogOpen(true); }}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>

                {/* Progress Circle (Centerpiece) */}
                <div className="flex justify-center py-2">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Circular Progress SVG */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                className="text-blue-900/20 stroke-current"
                                strokeWidth="8"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                            />
                            <circle
                                className="text-blue-500 progress-ring__circle stroke-current transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 40}`,
                                    strokeDashoffset: `${2 * Math.PI * 40 * (1 - percentage / 100)}`
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-foreground">
                                {(current / 1000).toFixed(1)}L
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                {percentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-4 gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAdd(250)}
                        className="border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/50 transition-all font-medium"
                    >
                        +250ml
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAdd(500)}
                        className="border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/50 transition-all font-medium"
                    >
                        +500ml
                    </Button>

                    <Dialog open={isCustomAddOpen} onOpenChange={setIsCustomAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/50 transition-all">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adicionar Quantidade</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <Label>Quantidade em ml</Label>
                                <Input
                                    type="number"
                                    value={customAmount}
                                    onChange={e => setCustomAmount(e.target.value)}
                                    placeholder="Ex: 300"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    {[100, 200, 300, 400].map(amt => (
                                        <Button key={amt} variant="outline" size="sm" onClick={() => setCustomAmount(amt)}>
                                            {amt}ml
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCustomAdd}>Adicionar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAdd(-250)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Config Dialog */}
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar Meta Diária</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Meta de Água (ml)</Label>
                        <Input
                            type="number"
                            value={tempGoal}
                            onChange={e => setTempGoal(e.target.value)}
                            placeholder="Ex: 2000"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveGoal}>Salvar Meta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
