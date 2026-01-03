"use client"

import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { companyExpenses, personalExpenses, formatCurrency, getStatusColor } from '@/data/mockData';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AccountsOverview() {
    const { context } = useFinancialContext();

    const expenses = context === 'empresa'
        ? companyExpenses
        : context === 'pessoal'
            ? personalExpenses
            : [...companyExpenses, ...personalExpenses];

    const overdueExpenses = expenses.filter(e => e.status === 'vencido');
    const pendingExpenses = expenses.filter(e => e.status === 'pendente');
    const paidExpenses = expenses.filter(e => e.status === 'pago');

    const overdueTotal = overdueExpenses.reduce((sum, e) => sum + e.valor, 0);
    const pendingTotal = pendingExpenses.reduce((sum, e) => sum + e.valor, 0);

    const recentExpenses = [...expenses]
        .sort((a, b) => b.dataVencimento.getTime() - a.dataVencimento.getTime())
        .slice(0, 5);

    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Contas a Pagar</h3>
                <a href="/dashboard/contas" className="text-sm text-primary hover:text-hover transition-colors">
                    Ver todas →
                </a>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-xs text-muted-foreground">Vencidas</span>
                    </div>
                    <p className="text-lg font-bold text-destructive">{overdueExpenses.length}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(overdueTotal)}</p>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-xs text-muted-foreground">Pendentes</span>
                    </div>
                    <p className="text-lg font-bold text-warning">{pendingExpenses.length}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(pendingTotal)}</p>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-xs text-muted-foreground">Pagas</span>
                    </div>
                    <p className="text-lg font-bold text-success">{paidExpenses.length}</p>
                </div>
            </div>

            {/* Recent List */}
            <div className="space-y-2">
                {recentExpenses.map((expense) => (
                    <div
                        key={expense.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{expense.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                                Vence: {format(expense.dataVencimento, "dd MMM", { locale: ptBR })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(expense.valor)}</p>
                            <span
                                className={cn(
                                    'inline-block text-xs px-2 py-0.5 rounded-full border',
                                    getStatusColor(expense.status)
                                )}
                            >
                                {expense.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
