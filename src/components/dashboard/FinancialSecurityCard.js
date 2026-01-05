import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Edit2 } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function FinancialSecurityCard() {
    const { accounts, investments, transactions, addLocalTransaction } = useFinancialContext();
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('income'); // 'income' (Deposit) or 'expense' (Withdraw)
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedId = localStorage.getItem('financial_securityAccountId');
            if (savedId) setSelectedAccountId(savedId);
        }
    }, []);

    const handleAccountSelect = (value) => {
        setSelectedAccountId(value);
        localStorage.setItem('financial_securityAccountId', value);
    };

    const handleTransaction = async () => {
        if (!amount || !selectedAccountId) return;

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return;

        const tx = {
            valor: numericAmount,
            type: transactionType, // 'income' or 'expense'
            categoria: 'Financeiro',
            descricao: description || (transactionType === 'income' ? 'Aporte em Reserva' : 'Resgate de Reserva'),
            data: new Date().toISOString().split('T')[0],
            status: 'pago',
            accountId: selectedAccountId,
            origem: 'pessoal' // Ensure personal context
        };

        await addLocalTransaction(tx);

        setIsTransactionDialogOpen(false);
        setAmount('');
        setDescription('');
    };

    const openTransactionDialog = (type) => {
        setTransactionType(type);
        setIsTransactionDialogOpen(true);
    };

    // Calculate monthly cost of living (Real Data: Average of last 3 months or just last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const personalExpenses = transactions.filter(t =>
        t.origem === 'pessoal' &&
        ['expense', 'despesa', 'saida', 'card_payment'].includes(t.type) &&
        new Date(t.date) >= thirtyDaysAgo
    );

    const totalMonthlyCost = personalExpenses.reduce((sum, e) => sum + Number(e.valor), 0);

    // Filter for Personal Accounts for dropdown
    const personalAccountOptions = accounts.filter(a =>
        (a.origem === 'pessoal' || !a.origem) // Default to personal if undefined or explicit
    );

    // Get Selected Account Data
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    // Security Calculation: depends on Selected Account Balance + Liquid Investments
    const accountBalance = selectedAccount ? Number(selectedAccount.saldoAtual || selectedAccount.balance) : 0;

    const liquidInvestments = investments.filter(
        i => i.origem === 'pessoal' && i.liquidez === 'imediata'
    );
    const liquidInvestmentsTotal = liquidInvestments.reduce((sum, i) => sum + Number(i.valorAtual), 0);

    const totalReserve = accountBalance + liquidInvestmentsTotal;
    const monthsOfSecurity = totalMonthlyCost > 0 ? totalReserve / totalMonthlyCost : 0;

    // Determine security level
    const getSecurityLevel = () => {
        if (monthsOfSecurity >= 6) return { level: 'Seguro', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
        if (monthsOfSecurity >= 3) return { level: 'Atenção', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle };
        return { level: 'Risco', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle };
    };

    const security = getSecurityLevel();
    const SecurityIcon = security.icon;
    const targetMonths = 6;
    const progressPercent = Math.min((monthsOfSecurity / targetMonths) * 100, 100);

    return (
        <div className="glass-card rounded-xl p-6 animate-slide-up relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Segurança Financeira</h3>
                <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full', security.bg)}>
                    <SecurityIcon className={cn('w-3.5 h-3.5', security.color)} />
                    <span className={cn('text-xs font-medium', security.color)}>{security.level}</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Account Selection */}
                <div className="flex flex-col gap-2">
                    <Select value={selectedAccountId} onValueChange={handleAccountSelect}>
                        <SelectTrigger className="w-full text-xs h-8 bg-secondary/30 border-transparent focus:ring-0">
                            <SelectValue placeholder="Selecione a conta de reserva" />
                        </SelectTrigger>
                        <SelectContent>
                            {personalAccountOptions.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.name} ({formatCurrency(acc.saldoAtual || acc.balance)})
                                </SelectItem>
                            ))}
                            {personalAccountOptions.length === 0 && (
                                <div className="p-2 text-xs text-muted-foreground text-center">Nenhuma conta pessoal encontrada.</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">Reserva Disponível</span>
                        </div>
                        {selectedAccountId && (
                            <div className="flex gap-2">
                                <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2 border-success/30 hover:bg-success/10 hover:text-success"
                                    onClick={() => openTransactionDialog('income')}
                                >
                                    Depositar
                                </Button>
                                <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => openTransactionDialog('expense')}
                                >
                                    Resgatar
                                </Button>
                            </div>
                        )}
                    </div>
                    <p className="text-2xl font-bold kpi-value">{formatCurrency(totalReserve)}</p>
                    {!selectedAccountId && <p className="text-[10px] text-muted-foreground mt-1">Selecione uma conta acima.</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Custo de Vida Mensal</p>
                        <p className="text-base font-semibold text-foreground">{formatCurrency(totalMonthlyCost)}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Meses de Segurança</p>
                        <p className={cn('text-base font-semibold', security.color)}>
                            {monthsOfSecurity.toFixed(1)} meses
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Meta: {targetMonths} meses de reserva</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn('h-full rounded-full transition-all duration-500', {
                                'bg-success': progressPercent >= 100,
                                'bg-warning': progressPercent >= 50 && progressPercent < 100,
                                'bg-destructive': progressPercent < 50,
                            })}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Transaction Dialog */}
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {transactionType === 'income' ? 'Depositar na Reserva' : 'Resgatar da Reserva'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                                type="number"
                                placeholder="0,00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição (Opcional)</Label>
                            <Input
                                type="text"
                                placeholder={transactionType === 'income' ? 'Ex: Aporte Mensal' : 'Ex: Emergência Médica'}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleTransaction}
                            className={transactionType === 'income' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
                        >
                            Confirmar {transactionType === 'income' ? 'Depósito' : 'Resgate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
