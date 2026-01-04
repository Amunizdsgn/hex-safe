"use client"

import { useState, useEffect } from 'react';
import { Target, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import { getCurrentDate, getCurrentMonth, getCurrentYear } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function InvestmentGoals({ currentAmount }) {
    // Load goal from localStorage or use default
    const [goalAmount, setGoalAmount] = useState(150000);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [tempGoal, setTempGoal] = useState(150000);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedGoal = localStorage.getItem('investmentGoal');
            const savedStart = localStorage.getItem('investmentGoalStart');
            const savedEnd = localStorage.getItem('investmentGoalEnd');

            if (savedGoal) setGoalAmount(Number(savedGoal));
            if (savedStart) setStartDate(savedStart);
            if (savedEnd) setEndDate(savedEnd);

            // Set defaults if not saved
            if (!savedStart) {
                const start = `Jan ${getCurrentYear()}`;
                setStartDate(start);
                localStorage.setItem('investmentGoalStart', start);
            }
            if (!savedEnd) {
                const end = `Dez ${getCurrentYear() + 1}`;
                setEndDate(end);
                localStorage.setItem('investmentGoalEnd', end);
            }
        }
    }, []);

    const handleSaveGoal = () => {
        setGoalAmount(tempGoal);
        localStorage.setItem('investmentGoal', tempGoal.toString());
        setIsDialogOpen(false);
    };

    const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
    const remaining = Math.max(goalAmount - currentAmount, 0);

    // Calculate monthly target
    const now = getCurrentDate();
    const currentMonthIndex = getCurrentMonth();
    const monthsInYear = 12;
    const monthlyTarget = goalAmount / monthsInYear;
    const expectedByNow = monthlyTarget * (currentMonthIndex + 1);
    const isOnTrack = currentAmount >= expectedByNow;

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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setTempGoal(goalAmount)}
                            >
                                Editar Meta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Configurar Meta de Patrimônio</DialogTitle>
                                <DialogDescription>
                                    Defina sua meta de patrimônio para acompanhar seu progresso
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goal">Meta (R$)</Label>
                                    <Input
                                        id="goal"
                                        type="number"
                                        step="1000"
                                        value={tempGoal}
                                        onChange={(e) => setTempGoal(Number(e.target.value))}
                                        placeholder="150000"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveGoal}>
                                    Salvar Meta
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {formatPercent(percentage)} Atingido
                    </span>
                    {isOnTrack ? (
                        <span className="text-xs text-success flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            No ritmo
                        </span>
                    ) : (
                        <span className="text-xs text-warning flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Abaixo da meta mensal
                        </span>
                    )}
                </div>

                <div className="mb-4">
                    <p className="text-3xl font-bold kpi-value mb-1">{formatCurrency(currentAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                        de {formatCurrency(goalAmount)}
                        <span className="text-xs ml-1">(Faltam {formatCurrency(remaining)})</span>
                    </p>
                </div>

                <Progress value={percentage} className="h-3 bg-secondary" indicatorClassName="bg-primary/80" />

                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground flex justify-between">
                    <span>Início: {startDate}</span>
                    <span>Projeção: {endDate}</span>
                </div>
            </div>
        </div>
    );
}
