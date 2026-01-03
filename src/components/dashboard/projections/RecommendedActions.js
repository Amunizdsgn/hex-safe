"use client"

import { Lightbulb, ArrowRight } from 'lucide-react';

export function RecommendedActions() {
    const actions = [
        { id: 1, type: 'receita', text: 'Cobrar Tech Solutions (R$ 15k) - Atraso leve', impact: 'high' },
        { id: 2, type: 'despesa', text: 'Renegociar AWS Services para plano anual', impact: 'medium' },
        { id: 3, type: 'venda', text: 'Focar no fechamento Grupo Alpha (80%)', impact: 'high' },
    ];

    return (
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-secondary/10 to-primary/5 border border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary fill-primary/20" />
                Ações Recomendadas
            </h3>

            <div className="space-y-3">
                {actions.map((action) => (
                    <div key={action.id} className="p-3 bg-background/50 rounded-lg border border-border/50 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${action.impact === 'high' ? 'bg-primary shadow-[0_0_8px_rgba(0,217,224,0.5)]' : 'bg-muted-foreground'}`}></div>
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.text}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                ))}
            </div>
        </div>
    );
}
