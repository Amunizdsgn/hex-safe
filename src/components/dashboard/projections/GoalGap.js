"use client"

import { Target, Flag } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { Progress } from "@/components/ui/progress";

export function GoalGap({ current, target, avgTicket }) {
    const gap = Math.max(target - current, 0);
    const progress = Math.min((current / target) * 100, 100);
    const projectsNeeded = avgTicket > 0 ? Math.ceil(gap / avgTicket) : 0;

    return (
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
                <Flag className="w-24 h-24 text-primary" />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Gap até a Meta
            </h3>

            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-3xl font-bold text-foreground">{formatPercent(progress)}</span>
                    <span className="text-sm font-medium text-muted-foreground">de {formatCurrency(target)}</span>
                </div>
                <Progress value={progress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Faltam</p>
                    <p className="text-lg font-bold text-warning">{formatCurrency(gap)}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Esforço Est.</p>
                    <p className="text-lg font-bold text-foreground">
                        {projectsNeeded} <span className="text-xs font-normal text-muted-foreground">projetos</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
