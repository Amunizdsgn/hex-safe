"use client"

import { CreditCard, Building2, Wallet, PiggyBank, PlusCircle, Trash2, Tag, Edit } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { useAccounts } from '@/hooks/useAccounts';
import { formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { AccountForm } from '@/components/forms/AccountForm';
import { CategoryManager } from '@/components/forms/CategoryManager';
import { CreditCardForm } from '@/components/forms/CreditCardForm';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    const { context, creditCards, removeCreditCard } = useFinancialContext();
    const { accounts, removeAccount } = useAccounts(context);
    const [editingCard, setEditingCard] = useState(null);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [selectedViewCard, setSelectedViewCard] = useState(null); // New State for View Mode

    const filteredAccounts = accounts;
    const filteredCreditCards = context === 'consolidado'
        ? creditCards
        : creditCards.filter(cc => {
            const origem = cc.origem || 'empresa';
            if (origem === 'conta') return context === 'empresa';
            return origem === context;
        });

    const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.saldoAtual, 0);
    const totalCreditLimit = filteredCreditCards.reduce((sum, cc) => sum + cc.limite, 0);
    const totalCreditUsed = filteredCreditCards.reduce((sum, cc) => sum + cc.faturaAtual, 0);
    const totalCreditAvailable = totalCreditLimit - totalCreditUsed;

    const byType = filteredAccounts.reduce((acc, account) => {
        if (!acc[account.tipo]) acc[account.tipo] = [];
        acc[account.tipo].push(account);
        return acc;
    }, {});

    const WalletsIcon = Wallet; // Fallback icon

    const confirmDeleteAccount = async () => {
        await removeAccount(accountToDelete);
        setAccountToDelete(null);
    };

    const confirmDeleteCard = () => {
        removeCreditCard(cardToDelete);
        setCardToDelete(null);
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

            {/* Credit Cards Section */}
            <div className="glass-card rounded-xl p-6 border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Cartões de Crédito</h3>
                            <p className="text-xs text-muted-foreground">{filteredCreditCards.length} cartão(ões)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Limite Disponível</p>
                            <p className="text-xl font-bold text-success">{formatCurrency(totalCreditAvailable)}</p>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Novo Cartão
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md">
                                <SheetHeader className="mb-6">
                                    <SheetTitle>Novo Cartão de Crédito</SheetTitle>
                                    <SheetDescription>Adicione um novo cartão de crédito</SheetDescription>
                                </SheetHeader>
                                <CreditCardForm onSuccess={() => { }} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {filteredCreditCards.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                        <p>Nenhum cartão cadastrado.</p>
                        <p className="text-xs mt-1">Clique em "Novo Cartão" para adicionar.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCreditCards.map((card) => {
                            const percentUsed = (card.faturaAtual / card.limite) * 100;
                            const isHighUsage = percentUsed > 80;
                            const isMediumUsage = percentUsed > 50 && percentUsed <= 80;

                            return (
                                <div
                                    key={card.id}
                                    className="group relative p-4 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
                                    style={{
                                        background: `linear-gradient(135deg, ${card.cor}15 0%, ${card.cor}05 100%)`,
                                        borderLeft: `4px solid ${card.cor}`
                                    }}
                                    onClick={() => setSelectedViewCard(card)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{card.nome}</p>
                                            <p className="text-xs text-muted-foreground">{card.bandeira} • {card.banco}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Venc. dia {card.vencimento}</p>
                                                {context === 'consolidado' && (
                                                    <span className={cn(
                                                        'text-xs px-2 py-0.5 rounded-full',
                                                        card.origem === 'empresa' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-highlight'
                                                    )}>
                                                        {card.origem === 'empresa' ? 'Empresa' : 'Pessoal'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <button
                                                            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
                                                            title="Editar cartão"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-full sm:max-w-md">
                                                        <SheetHeader className="mb-6">
                                                            <SheetTitle>Editar Cartão</SheetTitle>
                                                            <SheetDescription>Atualize as informações do cartão</SheetDescription>
                                                        </SheetHeader>
                                                        <CreditCardForm initialCard={card} onSuccess={() => { }} />
                                                    </SheetContent>
                                                </Sheet>
                                                <button
                                                    onClick={() => setCardToDelete(card.id)}
                                                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Excluir cartão"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Fatura Atual</span>
                                            <span className={cn(
                                                "font-semibold",
                                                isHighUsage ? "text-destructive" : isMediumUsage ? "text-warning" : "text-foreground"
                                            )}>
                                                {formatCurrency(card.faturaAtual)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Limite Total</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(card.limite)}</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-300",
                                                    isHighUsage ? "bg-destructive" : isMediumUsage ? "bg-warning" : "bg-success"
                                                )}
                                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">{percentUsed.toFixed(1)}% usado</span>
                                            <span className="text-success font-medium">
                                                {formatCurrency(card.limite - card.faturaAtual)} disponível
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Category Management Section */}
            <div className="glass-card rounded-xl p-6 border-primary/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Categorias de Transações</h3>
                            <p className="text-xs text-muted-foreground">Gerencie categorias de despesas e receitas</p>
                        </div>
                    </div>
                </div>

                <CategoryManager type="both" />
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
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <button
                                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                            title="Editar conta"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-full sm:max-w-md">
                                                        <SheetHeader className="mb-6">
                                                            <SheetTitle>Editar Conta</SheetTitle>
                                                            <SheetDescription>Atualize as informações da conta</SheetDescription>
                                                        </SheetHeader>
                                                        <AccountForm initialAccount={account} />
                                                    </SheetContent>
                                                </Sheet>
                                                <button
                                                    onClick={() => setAccountToDelete(account.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Excluir conta"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Account Confirmation */}
            <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Card Confirmation */}
            <AlertDialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Cartão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este cartão de crédito? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteCard} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Card Transactions Sheet */}
            <Sheet open={!!selectedViewCard} onOpenChange={(open) => !open && setSelectedViewCard(null)}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" style={{ color: selectedViewCard?.cor }} />
                            Extrato: {selectedViewCard?.nome}
                        </SheetTitle>
                        <SheetDescription>
                            Compras e parcelamentos vinculados a este cartão.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedViewCard && (
                        <div className="space-y-6">
                            {/* Card Summary */}
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fatura Atual</p>
                                        <p className="text-lg font-bold text-foreground">
                                            {formatCurrency(selectedViewCard.faturaAtual)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Limite Disponível</p>
                                        <p className="text-lg font-bold text-success">
                                            {formatCurrency(selectedViewCard.limite - selectedViewCard.faturaAtual)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.min((selectedViewCard.faturaAtual / selectedViewCard.limite) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Transactions List */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Histórico de Compras</h4>
                                <CardTransactionsList cardId={selectedViewCard.id} cardName={selectedViewCard.nome} />
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function CardTransactionsList({ cardId, cardName }) {
    const { transactions } = useFinancialContext();

    // Filter transactions for this card
    const cardTransactions = transactions.filter(t => {
        // Direct link via creditCardId
        if (t.creditCardId === cardId) return true;
        // Fallback: match by bank name (legacy)
        if (t.banco === cardName && t.metodo === 'credit') return true;
        // Fallback: check description for "Pagamento Fatura [CardName]"
        if (t.type === 'expense' && t.category === 'Pagamento de Cartão' && t.description?.includes(cardName)) return true;
        return false;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (cardTransactions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada para este cartão.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {cardTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            t.category === 'Pagamento de Cartão' ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                        )}>
                            {t.category === 'Pagamento de Cartão' ? 'PG' : (t.parcelaAtual ? `${t.parcelaAtual}x` : '1x')}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">{t.description}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(t.date).toLocaleDateString()} • {t.category}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={cn(
                            "text-sm font-semibold",
                            t.type === 'income' ? "text-success" : "text-foreground"
                        )}>
                            {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.valor)}
                        </p>
                        {t.parcelaAtual && (
                            <p className="text-[10px] text-muted-foreground">
                                Parcela {t.parcelaAtual}/{t.parcelas}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
