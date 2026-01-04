"use client"

import { useMemo, useState, useEffect } from 'react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Wallet, AlertCircle, CheckCircle2, Clock, Target, Edit2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProjectionsPage() {
    const { transactions, selectedMonth, selectedYear, context } = useFinancialContext();

    // --- Goal State - Separate for empresa and pessoal ---
    const getStorageKey = () => {
        if (context === 'empresa') return 'monthlyGoalEmpresa';
        if (context === 'pessoal') return 'monthlyGoalPessoal';
        return 'monthlyGoalConsolidado';
    };

    const getDefaultGoal = () => {
        if (context === 'empresa') return 80000; // Default empresa goal
        if (context === 'pessoal') return 20000; // Default pessoal goal
        // Consolidado = soma das metas de empresa e pessoal
        const empresaGoal = Number(localStorage.getItem('monthlyGoalEmpresa')) || 80000;
        const pessoalGoal = Number(localStorage.getItem('monthlyGoalPessoal')) || 20000;
        return empresaGoal + pessoalGoal;
    };

    const [monthlyGoal, setMonthlyGoal] = useState(() => {
        if (typeof window !== 'undefined') {
            const storageKey = getStorageKey();
            // For consolidado, always calculate from empresa + pessoal
            if (context === 'consolidado') {
                return getDefaultGoal();
            }
            return Number(localStorage.getItem(storageKey)) || getDefaultGoal();
        }
        return getDefaultGoal();
    });
    const [isEditingGoal, setIsEditingGoal] = useState(false);

    // Update goal when context changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storageKey = getStorageKey();
            // For consolidado, recalculate from empresa + pessoal
            if (context === 'consolidado') {
                const empresaGoal = Number(localStorage.getItem('monthlyGoalEmpresa')) || 80000;
                const pessoalGoal = Number(localStorage.getItem('monthlyGoalPessoal')) || 20000;
                setMonthlyGoal(empresaGoal + pessoalGoal);
            } else {
                const savedGoal = Number(localStorage.getItem(storageKey));
                setMonthlyGoal(savedGoal || getDefaultGoal());
            }
        }
    }, [context]);

    const handleSaveGoal = () => {
        // Don't allow editing consolidado goal (it's calculated)
        if (context === 'consolidado') {
            setIsEditingGoal(false);
            return;
        }
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, monthlyGoal);
        setIsEditingGoal(false);
    };

    // --- Calculations ---

    const metrics = useMemo(() => {
        // Filter by context first - with fallback for legacy transactions
        const contextTransactions = context === 'consolidado'
            ? transactions
            : transactions.filter(t => {
                // Fallback: if no origem field, assume 'empresa' (legacy)
                const transactionOrigem = t.origem || 'empresa';

                // Treat 'conta' as 'empresa' (legacy)
                if (transactionOrigem === 'conta') return context === 'empresa';

                return transactionOrigem === context;
            });

        const currentMonthTransactions = contextTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
        });

        const incomes = currentMonthTransactions.filter(t => ['income', 'revenue', 'receita'].includes(t.type));
        const expenses = currentMonthTransactions.filter(t => ['expense', 'despesa', 'saida', 'card_payment', 'pro_labore'].includes(t.type));

        // Income Metrics
        const incomePaid = incomes.filter(t => t.status === 'pago').reduce((sum, t) => sum + Number(t.valor), 0);
        const incomePending = incomes.filter(t => t.status === 'pendente' || t.status === 'vencido').reduce((sum, t) => sum + Number(t.valor), 0);
        const incomeTotal = incomePaid + incomePending;

        // Expense Metrics
        const expensePaid = expenses.filter(t => t.status === 'pago').reduce((sum, t) => sum + Number(t.valor), 0);
        const expensePending = expenses.filter(t => t.status === 'pendente' || t.status === 'vencido').reduce((sum, t) => sum + Number(t.valor), 0);
        const expenseTotal = expensePaid + expensePending;

        // Breakdown by Category for analysis (Simple Top 3)
        // Grouping incomes
        const incomeByCategory = incomes.reduce((acc, t) => {
            acc[t.category || 'Outros'] = (acc[t.category || 'Outros'] || 0) + Number(t.valor);
            return acc;
        }, {});

        // Grouping expenses
        const expenseByCategory = expenses.reduce((acc, t) => {
            acc[t.category || 'Outros'] = (acc[t.category || 'Outros'] || 0) + Number(t.valor);
            return acc;
        }, {});

        return {
            income: { paid: incomePaid, pending: incomePending, total: incomeTotal, byCategory: incomeByCategory },
            expense: { paid: expensePaid, pending: expensePending, total: expenseTotal, byCategory: expenseByCategory },
            balance: incomeTotal - expenseTotal
        };
    }, [transactions, selectedMonth, selectedYear, context]);

    // Format Currency Helper
    const formatBRL = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Progress calculation
    const incomeProgress = metrics.income.total > 0 ? (metrics.income.paid / metrics.income.total) * 100 : 0;
    const expenseProgress = metrics.expense.total > 0 ? (metrics.expense.paid / metrics.expense.total) * 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Projeção de Fluxo de Caixa</h2>
                    <p className="text-muted-foreground">Previsão simples de entradas, saídas e saldo final para o mês.</p>
                </div>

                {/* Goal Input Section */}
                <div className="flex flex-col items-end gap-1">
                    <label className="text-xs text-muted-foreground font-medium">
                        Meta Mensal {context === 'consolidado' && '(Calculada)'}
                    </label>
                    {isEditingGoal ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Input
                                type="number"
                                value={monthlyGoal}
                                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                                className="h-8 w-32 bg-background border-primary/50 focus-visible:ring-primary"
                                autoFocus
                            />
                            <Button size="sm" onClick={handleSaveGoal} className="h-8">Salvar</Button>
                        </div>
                    ) : (
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg border border-transparent transition-all group ${context !== 'consolidado'
                                ? 'hover:bg-secondary/20 cursor-pointer hover:border-border'
                                : 'cursor-default opacity-75'
                                }`}
                            onClick={() => context !== 'consolidado' && setIsEditingGoal(true)}
                            title={context === 'consolidado' ? 'Meta calculada automaticamente (Empresa + Pessoal)' : 'Clique para editar'}
                        >
                            <Target className={`w-4 h-4 text-primary ${context !== 'consolidado' ? 'group-hover:scale-110' : ''} transition-transform`} />
                            <span className="text-xl font-bold text-foreground">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyGoal)}
                            </span>
                            {context !== 'consolidado' && (
                                <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- Goal Progress Section --- */}
            <Card className="bg-gradient-to-r from-background to-secondary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-end mb-2">
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
                                <Target className="w-4 h-4" /> Progresso da Meta
                            </h3>
                            <div className="text-2xl font-bold">
                                {((metrics.income.total / monthlyGoal) * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Falta para a Meta</div>
                            <div className="font-mono font-bold text-primary">
                                {metrics.income.total >= monthlyGoal
                                    ? "Meta Batida! 🚀"
                                    : formatBRL(Math.max(0, monthlyGoal - metrics.income.total))}
                            </div>
                        </div>
                    </div>
                    <Progress value={(metrics.income.total / monthlyGoal) * 100} className="h-3" />
                </CardContent>
            </Card>

            {/* --- Main Cards Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Incomes Card */}
                <Card className="border-l-4 border-l-success bg-gradient-to-br from-background to-success/5 shadow-lg">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg text-success flex items-center gap-2">
                                    <ArrowUpCircle className="w-5 h-5" /> Entradas Previstas
                                </CardTitle>
                                <CardDescription>Recebido + A Receber</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4">{formatBRL(metrics.income.total)}</div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Já Recebido</span>
                                <span className="font-bold text-success/80">{formatBRL(metrics.income.paid)}</span>
                            </div>
                            <Progress value={incomeProgress} className="h-2 bg-success/20" indicatorClassName="bg-success" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Falta Receber</span>
                                <span className="font-bold text-muted-foreground">{formatBRL(metrics.income.pending)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Expenses Card */}
                <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-background to-destructive/5 shadow-lg">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg text-destructive flex items-center gap-2">
                                    <ArrowDownCircle className="w-5 h-5" /> Saídas Previstas
                                </CardTitle>
                                <CardDescription>Pago + A Pagar</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4">{formatBRL(metrics.expense.total)}</div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-destructive" /> Já Pago</span>
                                <span className="font-bold text-destructive/80">{formatBRL(metrics.expense.paid)}</span>
                            </div>
                            <Progress value={expenseProgress} className="h-2 bg-destructive/20" indicatorClassName="bg-destructive" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Falta Pagar</span>
                                <span className="font-bold text-muted-foreground">{formatBRL(metrics.expense.pending)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Balance Card */}
                <Card className={`border-l-4 shadow-lg ${metrics.balance >= 0 ? 'border-l-blue-500 bg-gradient-to-br from-background to-blue-500/5' : 'border-l-red-500 bg-gradient-to-br from-background to-red-500/5'}`}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className={`text-lg flex items-center gap-2 ${metrics.balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                    <Wallet className="w-5 h-5" /> Saldo Projetado
                                </CardTitle>
                                <CardDescription>O que sobra no final do mês</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold mb-4 ${metrics.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatBRL(metrics.balance)}
                        </div>

                        <div className="p-3 rounded-lg bg-secondary/10 border border-border/50 text-sm mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-muted-foreground">Margem Projetada:</span>
                                <span className="font-bold">
                                    {metrics.income.total > 0 ? ((metrics.balance / metrics.income.total) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                                {metrics.balance > 0
                                    ? "Parabéns! Previsão de caixa positivo esse mês."
                                    : "Atenção! As despesas superam as receitas previstas."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Simplest Summary List --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Income Breakdown */}
                <div className="space-y-4">
                    <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4" /> Composição das Entradas
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(metrics.income.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                            <div key={cat} className="flex justify-between items-center text-sm p-3 bg-secondary/5 rounded border border-border/40">
                                <span className="font-medium">{cat}</span>
                                <span className="font-mono text-success">{formatBRL(val)}</span>
                            </div>
                        ))}
                        {Object.keys(metrics.income.byCategory).length === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm italic">Nenhuma entrada registrada.</div>
                        )}
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="space-y-4">
                    <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4" /> Composição das Saídas
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(metrics.expense.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                            <div key={cat} className="flex justify-between items-center text-sm p-3 bg-secondary/5 rounded border border-border/40">
                                <span className="font-medium">{cat}</span>
                                <span className="font-mono text-destructive">{formatBRL(val)}</span>
                            </div>
                        ))}
                        {Object.keys(metrics.expense.byCategory).length === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm italic">Nenhuma saída registrada.</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
