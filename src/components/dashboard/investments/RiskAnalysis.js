"use client"

import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

export function RiskAnalysis({ investments }) {
    // Calculate Risk Score (Simplified Algorithm)
    // 0-30: Conservative, 31-70: Moderate, 71-100: Aggressive

    // Weight: Crypto (high), Variable (med), Fixed (low)
    let totalScore = 0;
    let totalValue = 0;

    investments.forEach(inv => {
        let weight = 10; // Default Low
        if (inv.tipo === 'cripto') weight = 90;
        else if (inv.tipo === 'renda_variavel' || inv.tipo === 'fundo') weight = 60;
        else if (inv.tags?.includes('risco_alto')) weight = 80;

        totalScore += weight * inv.valorAtual;
        totalValue += inv.valorAtual;
    });

    const avgRiskScore = totalValue > 0 ? Math.round(totalScore / totalValue) : 0;

    let profile = { label: 'Conservador', color: 'text-success', icon: ShieldCheck, description: 'Prioridade em segurança e liquidez.' };
    if (avgRiskScore > 30) profile = { label: 'Moderado', color: 'text-warning', icon: Shield, description: 'Equilíbrio entre risco e retorno.' };
    if (avgRiskScore > 70) profile = { label: 'Agressivo', color: 'text-destructive', icon: ShieldAlert, description: 'Foco em maximizar rentabilidade.' };

    return (
        <div className="glass-card rounded-xl p-6 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Perfil de Risco</h3>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-3 rounded-full bg-secondary", profile.color)}>
                        <profile.icon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className={cn("text-2xl font-bold", profile.color)}>{profile.label}</p>
                        <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservador</span>
                    <span>Moderado</span>
                    <span>Agressivo</span>
                </div>
                <Progress value={avgRiskScore} className="h-4" indicatorClassName={
                    avgRiskScore > 70 ? "bg-destructive" : avgRiskScore > 30 ? "bg-warning" : "bg-success"
                } />
                <div className="text-center text-xs font-mono text-muted-foreground mt-1">
                    Score: {avgRiskScore}/100
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50 text-xs text-muted-foreground">
                <p>Diversificação: <span className="text-foreground font-medium">{investments.length} ativos</span></p>
            </div>
        </div>
    );
}
