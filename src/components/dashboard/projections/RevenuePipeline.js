"use client"

import { Briefcase, ChevronRight } from 'lucide-react';
import { formatCurrency, formatPercent, salesPipeline } from '@/data/mockData';

export function RevenuePipeline() {
    // Group pipeline by stage
    const totalPipeline = salesPipeline.reduce((acc, item) => acc + item.value, 0);
    const weightedPipeline = salesPipeline.reduce((acc, item) => acc + (item.value * item.probability), 0);

    return (
        <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Pipeline de Receitas
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Projeção: {formatCurrency(weightedPipeline)}
                </span>
            </div>

            <div className="space-y-3">
                {salesPipeline.slice(0, 4).map((deal) => (
                    <div key={deal.id} className="p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-foreground">{deal.client}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${deal.probability >= 0.8 ? 'bg-success/20 text-success' :
                                        deal.probability >= 0.5 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {formatPercent(deal.probability * 100)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{deal.project} • {deal.stage}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-sm text-foreground">{formatCurrency(deal.value)}</p>
                            <p className="text-[10px] text-muted-foreground">
                                Est. {formatCurrency(deal.value * deal.probability)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 text-xs text-primary font-medium hover:underline flex items-center justify-center gap-1">
                Ver todo o pipeline <ChevronRight className="w-3 h-3" />
            </button>
        </div>
    );
}
