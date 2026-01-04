"use client"

import { Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value / 100);
};

export function RevenuePipeline({ deals = [] }) {
    // Calculate total weighted pipeline
    const weightedPipeline = deals.reduce((acc, deal) => {
        // Default probability based on stage if not present
        let prob = deal.probability || 0;
        if (!deal.probability) {
            if (deal.stage === 'Lead') prob = 0.1;
            else if (deal.stage === 'Qualificação') prob = 0.3;
            else if (deal.stage === 'Proposta') prob = 0.6;
            else if (deal.stage === 'Negociação') prob = 0.8;
        }
        return acc + (deal.value * prob);
    }, 0);

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
                {deals.slice(0, 4).map((deal) => {
                    let prob = deal.probability || 0;
                    if (!deal.probability) {
                        if (deal.stage === 'Lead') prob = 0.1;
                        else if (deal.stage === 'Qualificação') prob = 0.3;
                        else if (deal.stage === 'Proposta') prob = 0.6;
                        else if (deal.stage === 'Negociação') prob = 0.8;
                    }

                    return (
                        <div key={deal.id} className="p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors flex justify-between items-center group">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-foreground">{deal.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${prob >= 0.8 ? 'bg-success/20 text-success' :
                                        prob >= 0.5 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {formatPercent(prob * 100)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{deal.stage}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-sm text-foreground">{formatCurrency(deal.value)}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    Est. {formatCurrency(deal.value * prob)}
                                </p>
                            </div>
                        </div>
                    )
                })}
                {deals.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma oportunidade aberta.</p>
                )}
            </div>

            <Link href="/dashboard/crm" className="w-full mt-4 text-xs text-primary font-medium hover:underline flex items-center justify-center gap-1">
                Ver todo o pipeline <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
