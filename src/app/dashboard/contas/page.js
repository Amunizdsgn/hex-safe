"use client"

import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Filter, PlusCircle, ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { companyExpenses, personalExpenses, companyRevenues, personalRevenues, formatCurrency, getStatusColor } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function CashFlowPage() {
    const { context, selectedMonth, selectedYear, transactions, removeLocalTransaction } = useFinancialContext();
    const [activeTab, setActiveTab] = useState('pagar');
    const [statusFilter, setStatusFilter] = useState('all');
    const [transactionToEdit, setTransactionToEdit] = useState(null);

    // Filter transactions by context and type
    const allExpenses = transactions.filter(t => {
        const matchesContext = context === 'consolidado'
            ? true
            : t.origem === context;

        // A transaction is an expense if type is explicitly 'expense'
        const isExpense = ['expense', 'despesa', 'saida'].includes(t.type?.toLowerCase());

        return isExpense && matchesContext;
    });

    const allRevenues = transactions.filter(t => {
        const matchesContext = context === 'consolidado'
            ? true
            : t.origem === context;

        // A transaction is revenue if type is explicitly 'income'
        const isRevenue = ['income', 'revenue', 'receita'].includes(t.type?.toLowerCase());

        return isRevenue && matchesContext;
    });

    const expenses = allExpenses.map(e => ({
        ...e,
        dataVencimento: e.dataVencimento || new Date(e.date || e.data || new Date()),
        descricao: e.descricao || e.description || e.category || e.categoria || e.servico || 'Sem descrição',
        banco: e.banco || e.origem || 'Caixa',
        metodo: e.metodo || e.metodoPagamento || 'Pix'
    }));

    const revenues = allRevenues.map(r => ({
        ...r,
        data: r.data || new Date(r.date || new Date()),
        cliente: r.cliente || r.clientName || 'Cliente',
        banco: r.banco || r.origem || 'Caixa',
        metodo: r.metodo || r.metodoPagamento || 'Pix'
    }));

    // Filter by selected month/year
    const filterByMonthYear = (items, dateField) => {
        if (selectedMonth === null || selectedYear === null) return items;

        return items.filter(item => {
            const itemDate = item[dateField];
            return itemDate.getMonth() === selectedMonth && itemDate.getFullYear() === selectedYear;
        });
    };

    const expensesFiltered = filterByMonthYear(expenses, 'dataVencimento');
    const revenuesFiltered = filterByMonthYear(revenues, 'data');

    const filteredExpenses = statusFilter === 'all'
        ? expensesFiltered
        : expensesFiltered.filter(e => e.status === statusFilter);

    const filteredRevenues = statusFilter === 'all'
        ? revenuesFiltered
        : revenuesFiltered.filter(r => r.status === statusFilter);

    // Summary (using filtered data)
    const overdueItems = expensesFiltered.filter(e => e.status === 'vencido');
    const pendingItems = expensesFiltered.filter(e => e.status === 'pendente');
    const paidExpenses = expensesFiltered.filter(e => e.status === 'pago');
    const paidRevenues = revenuesFiltered.filter(r => r.status === 'pago');

    const overdueTotal = overdueItems.reduce((sum, e) => sum + e.valor, 0);
    const pendingTotal = pendingItems.reduce((sum, e) => sum + e.valor, 0);
    const paidExpensesTotal = paidExpenses.reduce((sum, e) => sum + e.valor, 0);
    const paidRevenuesTotal = paidRevenues.reduce((sum, r) => sum + r.valor, 0);

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            removeLocalTransaction(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Fluxo de Caixa</h2>
                    <p className="text-muted-foreground">Controle detalhado de todas as entradas e saídas.</p>
                </div>
                {/* Create Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="gradient-primary shadow-lg shadow-primary/20" size="sm">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Novo Lançamento
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-background/80 backdrop-blur-xl">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-2xl font-bold">Novo Lançamento</SheetTitle>
                            <SheetDescription>Registre uma receita ou despesa no sistema.</SheetDescription>
                        </SheetHeader>
                        <TransactionForm onSuccess={() => { }} />
                    </SheetContent>
                </Sheet>

                {/* Edit Sheet (Controlled) */}
                <Sheet open={!!transactionToEdit} onOpenChange={(open) => !open && setTransactionToEdit(null)}>
                    <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-background/80 backdrop-blur-xl">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-2xl font-bold">Editar Lançamento</SheetTitle>
                            <SheetDescription>Altere as informações do lançamento.</SheetDescription>
                        </SheetHeader>
                        {transactionToEdit && (
                            <TransactionForm
                                initialTransaction={transactionToEdit}
                                onSuccess={() => setTransactionToEdit(null)}
                            />
                        )}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5 border-destructive/30 bg-destructive/5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-16 h-16 text-destructive" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                            <ArrowDownCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Vencidas / Atrasadas</p>
                            <p className="text-xl font-bold text-destructive">{formatCurrency(overdueTotal)}</p>
                            <p className="text-xs text-muted-foreground">{overdueItems.length} contas</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-5 border-warning/30 bg-warning/5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-warning" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">A Pagar (Previsão)</p>
                            <p className="text-xl font-bold text-warning">{formatCurrency(pendingTotal)}</p>
                            <p className="text-xs text-muted-foreground">{pendingItems.length} contas</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-5 border-primary/30 bg-primary/5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowDownCircle className="w-16 h-16 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <ArrowDownCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pago no Mês</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(paidExpensesTotal)}</p>
                            <p className="text-xs text-muted-foreground">{paidExpenses.length} despesas</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-5 border-success/30 bg-success/5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowUpCircle className="w-16 h-16 text-success" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                            <ArrowUpCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Recebido no Mês</p>
                            <p className="text-xl font-bold text-success">{formatCurrency(paidRevenuesTotal)}</p>
                            <p className="text-xs text-muted-foreground">{paidRevenues.length} receitas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('pagar')}
                        className={cn(
                            'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                            activeTab === 'pagar'
                                ? 'bg-destructive/20 text-destructive shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <ArrowDownCircle className="w-4 h-4" />
                        Saídas
                    </button>
                    <button
                        onClick={() => setActiveTab('receber')}
                        className={cn(
                            'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                            activeTab === 'receber'
                                ? 'bg-success/20 text-success shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <ArrowUpCircle className="w-4 h-4" />
                        Entradas
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                    >
                        <option value="all">Todos os status</option>
                        <option value="pago">Confirmados</option>
                        <option value="pendente">Pendentes</option>
                        <option value="vencido">Vencidos</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden min-h-[400px] pb-24">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr className="border-b border-border/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Descrição / Categoria</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Conta / Banco</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Método</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Data</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Valor</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Status</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {activeTab === 'pagar' ? (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{expense.descricao}</span>
                                                <span className="text-xs text-muted-foreground">{expense.categoria}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-3 h-3 text-muted-foreground/70" />
                                                {expense.banco}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3 h-3 text-muted-foreground/70" />
                                                {expense.metodo}
                                                {expense.parcelas > 1 && <span className="text-[10px] bg-secondary px-1 rounded">{expense.parcelas}x</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">
                                            {format(expense.dataVencimento, "dd/MM/yyyy")}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-destructive">
                                            - {formatCurrency(expense.valor)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                getStatusColor(expense.status)
                                            )}>
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setTransactionToEdit(expense)}
                                                    className="p-1 px-2 text-muted-foreground hover:text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-1 px-2 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredRevenues.map((revenue) => (
                                    <tr key={revenue.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">
                                                    {revenue.serviceName || revenue.servico || revenue.descricao || revenue.cliente || 'Receita Diversa'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {revenue.category || revenue.categoria || 'Serviços'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-3 h-3 text-muted-foreground/70" />
                                                {revenue.banco}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3 h-3 text-muted-foreground/70" />
                                                {revenue.metodo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground font-mono text-xs">
                                            {format(revenue.data, "dd/MM/yyyy")}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-success">
                                            + {formatCurrency(revenue.valor)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                                getStatusColor(revenue.status)
                                            )}>
                                                {revenue.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setTransactionToEdit(revenue)}
                                                    className="p-1 px-2 text-muted-foreground hover:text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(revenue.id)}
                                                    className="p-1 px-2 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
