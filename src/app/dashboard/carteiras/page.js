"use client"

import { CreditCard, Building2, Wallet, PiggyBank, PlusCircle, Trash2 } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { useAccounts } from '@/hooks/useAccounts';
import { formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { AccountForm } from '@/components/forms/AccountForm';

const typeIcons = {
    banco: Building2,
    carteira: Wallet,
    investimento: PiggyBank,
};

const typeLabels = {
    banco: 'Conta Bancária',
    carteira: 'Carteira Digital',
    investimento: 'Investimento',
};

export default function WalletsPage() {
    const { context } = useFinancialContext();
    const { accounts, removeAccount } = useAccounts(context);

    const filteredAccounts = accounts;

    const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.saldoAtual, 0);

    const byType = filteredAccounts.reduce((acc, account) => {
        if (!acc[account.tipo]) acc[account.tipo] = [];
        acc[account.tipo].push(account);
        return acc;
    }, {});

    const WalletsIcon = Wallet; // Fallback icon

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
            await removeAccount(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Carteiras</h2>
                    <p className="text-muted-foreground">Saldo disponível em contas e carteiras</p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="gradient-primary" size="sm">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Nova Carteira
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-background/80 backdrop-blur-xl">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-2xl font-bold">Nova Carteira</SheetTitle>
                            <SheetDescription>Cadastre uma nova conta bancária ou carteira.</SheetDescription>
                        </SheetHeader>
                        <AccountForm />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Total */}
            <div className="glass-card rounded-xl p-6 border-primary/30 glow-primary">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                        <CreditCard className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Total Disponível</p>
                        <p className="text-3xl font-bold kpi-value">{formatCurrency(totalBalance)}</p>
                    </div>
                </div>
            </div>

            {/* Accounts by Type */}
            <div className="space-y-6">
                {Object.keys(byType).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        Nenhuma conta ou carteira encontrada.
                    </div>
                )}
                {Object.entries(byType).map(([type, accounts]) => {
                    const Icon = typeIcons[type] || WalletsIcon;
                    const typeTotal = accounts.reduce((sum, a) => sum + a.saldoAtual, 0);

                    return (
                        <div key={type} className="glass-card rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{typeLabels[type] || type}</h3>
                                        <p className="text-xs text-muted-foreground">{accounts.length} conta(s)</p>
                                    </div>
                                </div>
                                <p className="text-xl font-bold kpi-value">{formatCurrency(typeTotal)}</p>
                            </div>

                            <div className="space-y-3">
                                {accounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="group flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                                <span className="text-sm font-bold text-foreground">
                                                    {account.banco ? account.banco.charAt(0) : account.nome.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{account.nome}</p>
                                                {account.banco && (
                                                    <p className="text-xs text-muted-foreground">{account.banco}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-foreground">{formatCurrency(account.saldoAtual)}</p>
                                                {context === 'consolidado' && (
                                                    <span className={cn(
                                                        'text-xs px-2 py-0.5 rounded-full',
                                                        account.origem === 'empresa' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-highlight'
                                                    )}>
                                                        {account.origem === 'empresa' ? 'Empresa' : 'Pessoal'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(account.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Excluir conta"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
