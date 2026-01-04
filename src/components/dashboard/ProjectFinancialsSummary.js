"use client"

import { useFinancialContext } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, CheckCircle2, Clock, AlertCircle, PlusCircle, UserPlus, Wallet, Zap } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';


export function ProjectFinancialsSummary() {
    const { clients } = useFinancialContext();

    // Calculate Totals
    const financials = clients.reduce((acc, client) => {
        const projects = client.internalData?.projects || [];
        projects.forEach(project => {
            const value = Number(project.value) || 0;
            const paid = Number(project.paid) || 0;
            acc.totalValue += value;
            acc.totalPaid += paid;
            acc.totalPending += (value - paid);
        });
        return acc;
    }, { totalValue: 0, totalPaid: 0, totalPending: 0 });

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const progress = financials.totalValue > 0 ? (financials.totalPaid / financials.totalValue) * 100 : 0;

    if (financials.totalValue === 0) {
        return (
            <Card className="glass-card animate-slide-up h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Acesso Rápido
                    </CardTitle>
                    <CardDescription>Atalhos para as principais funções</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/fluxo-de-caixa" className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 hover:scale-[1.02] transition-all border border-border/50 group">
                        <div className="bg-primary/10 p-2 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
                            <PlusCircle className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Novo Lançamento</span>
                    </Link>
                    <Link href="/dashboard/clientes" className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 hover:scale-[1.02] transition-all border border-border/50 group">
                        <div className="bg-blue-500/10 p-2 rounded-full mb-2 group-hover:bg-blue-500/20 transition-colors">
                            <UserPlus className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Novo Cliente</span>
                    </Link>
                    <Link href="/dashboard/crm" className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 hover:scale-[1.02] transition-all border border-border/50 group">
                        <div className="bg-purple-500/10 p-2 rounded-full mb-2 group-hover:bg-purple-500/20 transition-colors">
                            <Briefcase className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Novo Negócio</span>
                    </Link>
                    <Link href="/dashboard/carteiras" className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 hover:scale-[1.02] transition-all border border-border/50 group">
                        <div className="bg-green-500/10 p-2 rounded-full mb-2 group-hover:bg-green-500/20 transition-colors">
                            <Wallet className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Nova Carteira</span>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card animate-slide-up">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" /> Financeiro de Projetos
                </CardTitle>
                <CardDescription>Resumo de cobranças em projetos pontuais</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Valor Total em Projetos</span>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(financials.totalValue)}</div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground"><CheckCircle2 className="w-3 h-3 text-success" /> Recebido</span>
                            <span className="font-bold text-success">{formatCurrency(financials.totalPaid)}</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-secondary" indicatorClassName="bg-success" />
                    </div>

                    <div className="flex justify-between text-sm p-3 bg-secondary/10 rounded-lg border border-border/50">
                        <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3 text-warning" /> A Receber</span>
                        <span className="font-bold text-warning">{formatCurrency(financials.totalPending)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
