"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Loader2, CreditCard, Wallet, Landmark, QrCode, FileText, ArrowUpCircle, ArrowDownCircle, Plus, Briefcase, ArrowRightLeft } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
// import { financialAccounts } from '@/data/mockData'; // Removing static import
import { CategoryManager } from './CategoryManager';

export function TransactionForm({ onSuccess, initialTransaction }) {
    const { context, clients, creditCards, updateCreditCard, addLocalTransaction, updateLocalTransaction, expenseCategories, incomeCategories, accounts: financialAccounts } = useFinancialContext();
    const [loading, setLoading] = useState(false);

    const isEditing = !!initialTransaction;

    // Form States - initialize with existing data if editing
    const [formData, setFormData] = useState({
        description: initialTransaction?.descricao || initialTransaction?.description || '',
        amount: initialTransaction?.valor?.toString() || '',
        type: initialTransaction?.type || 'expense',
        category: initialTransaction?.categoria || initialTransaction?.category || '',
        date: initialTransaction?.date || initialTransaction?.data?.toISOString?.().split('T')[0] || new Date().toISOString().split('T')[0],
        status: initialTransaction?.status || 'pago',
        clientId: initialTransaction?.clientId || '',
        clientName: initialTransaction?.cliente || initialTransaction?.clientName || '',
        bankAccountId: initialTransaction?.bankAccountId || '',
        paymentMethod: initialTransaction?.metodo || initialTransaction?.metodoPagamento || 'pix',
        installments: initialTransaction?.parcelas?.toString() || '1',
        selectedCardId: '', // For paying a bill
        destinationAccountId: '', // For transfers
        isRecurrent: false
    });

    const paymentMethods = [
        { id: 'pix', label: 'Pix', icon: <QrCode className="w-4 h-4" /> },
        { id: 'credit', label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'debit', label: 'Cartão de Débito', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'boleto', label: 'Boleto', icon: <FileText className="w-4 h-4" /> },
        { id: 'money', label: 'Dinheiro', icon: <Wallet className="w-4 h-4" /> },
        { id: 'transfer', label: 'TED/DOC', icon: <Landmark className="w-4 h-4" /> },
    ];

    // Filter bank accounts by context
    const availableAccounts = financialAccounts.filter(acc => {
        if (context === 'consolidado') return true;
        return acc.origem === context;
    });

    // Filter credit cards by context
    const availableCreditCards = creditCards.filter(cc => {
        if (context === 'consolidado') return true;
        return cc.origem === context;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description && formData.type !== 'card_payment' && !formData.amount) return;

        setLoading(true);

        try {
            // SPECIAL HANDLER: Credit Card Payment
            if (formData.type === 'card_payment') {
                if (!formData.selectedCardId || !formData.bankAccountId) {
                    alert('Selecione o cartão e a conta de pagamento.');
                    setLoading(false);
                    return;
                }

                const selectedCard = creditCards.find(c => c.id === formData.selectedCardId);
                const paymentAmount = parseFloat(formData.amount);

                // 1. Create Expense Transaction
                const transactionData = {
                    descricao: `Pagamento Fatura ${selectedCard?.nome || 'Cartão'}`,
                    description: `Pagamento Fatura ${selectedCard?.nome || 'Cartão'}`,
                    valor: paymentAmount,
                    type: 'expense',
                    categoria: 'Pagamento de Cartão',
                    category: 'Pagamento de Cartão',
                    date: formData.date,
                    data: new Date(formData.date),
                    status: 'pago',
                    origem: context === 'consolidado' ? 'empresa' : context,
                    banco: financialAccounts.find(a => a.id === formData.bankAccountId)?.nome || 'Conta',
                    accountId: formData.bankAccountId, // Link to account for balance deduction
                    metodo: 'transfer',
                    metodoPagamento: 'transfer',
                    parcelas: 1,
                    cliente: 'Administrativo',
                    servico: 'Financeiro'
                };

                addLocalTransaction({ id: Date.now(), ...transactionData });

                // 2. Reduce Credit Card Invoice (Limit Release)
                if (selectedCard) {
                    const newInvoiceValue = Math.max(0, selectedCard.faturaAtual - paymentAmount);
                    updateCreditCard(selectedCard.id, { faturaAtual: newInvoiceValue });
                }

            } else if (formData.type === 'pro_labore') {
                // SPECIAL HANDLER: Pro-Labore
                const transactionData = {
                    descricao: formData.description || 'Retirada de Pro-Labore',
                    description: formData.description || 'Retirada de Pro-Labore',
                    valor: parseFloat(formData.amount),
                    type: 'expense',
                    categoria: 'Pro-Labore',
                    category: 'Pro-Labore',
                    date: formData.date,
                    data: new Date(formData.date),
                    status: 'pago',
                    origem: context === 'consolidado' ? 'empresa' : context,
                    banco: financialAccounts.find(a => a.id === formData.bankAccountId)?.nome || 'Conta',
                    accountId: formData.bankAccountId,
                    metodo: 'transfer',
                    metodoPagamento: 'transfer',
                    parcelas: 1,
                    cliente: 'Sócios',
                    servico: 'Administrativo'
                };

                addLocalTransaction({ id: Date.now(), ...transactionData });

            } else if (formData.type === 'transfer') {
                // SPECIAL HANDLER: Internal Transfer
                if (!formData.bankAccountId || !formData.destinationAccountId || !formData.amount) {
                    alert('Preencha conta de origem, destino e valor.');
                    setLoading(false);
                    return;
                }

                const amount = parseFloat(formData.amount);
                const dateData = formData.date;
                const originAccount = financialAccounts.find(a => a.id === formData.bankAccountId);
                const destAccount = financialAccounts.find(a => a.id === formData.destinationAccountId);

                // 1. Outgoing Transaction (Expense)
                const expenseId = Date.now();
                const expenseData = {
                    descricao: `Transferência para ${destAccount?.nome || 'Conta'}`,
                    description: `Transferência para ${destAccount?.nome || 'Conta'}`,
                    valor: amount,
                    type: 'expense',
                    categoria: 'Transferência',
                    category: 'Transferência',
                    date: dateData,
                    data: new Date(dateData),
                    status: 'pago',
                    origem: context === 'consolidado' ? 'empresa' : context,
                    banco: originAccount?.nome || 'Conta',
                    accountId: formData.bankAccountId,
                    metodo: 'transfer',
                    metodoPagamento: 'transfer',
                    parcelas: 1,
                    cliente: 'Interno',
                    servico: 'Transferência'
                };
                addLocalTransaction({ id: expenseId, ...expenseData });

                // 2. Incoming Transaction (Income)
                // Small delay to ensure unique ID if needed, though Date.now() + 1 is usually enough in loop
                const incomeData = {
                    descricao: `Recebido de ${originAccount?.nome || 'Conta'}`,
                    description: `Recebido de ${originAccount?.nome || 'Conta'}`,
                    valor: amount,
                    type: 'income',
                    categoria: 'Transferência',
                    category: 'Transferência',
                    date: dateData,
                    data: new Date(dateData),
                    status: 'pago',
                    origem: context === 'consolidado' ? 'empresa' : context,
                    banco: destAccount?.nome || 'Conta',
                    accountId: formData.destinationAccountId,
                    metodo: 'transfer',
                    metodoPagamento: 'transfer',
                    parcelas: 1,
                    cliente: 'Interno',
                    servico: 'Transferência'
                };
                addLocalTransaction({ id: expenseId + 1, ...incomeData });

            } else {
                // STANDARD HANDLER (Income / Expense)

                // HANDLE CREDIT CARD EXPENSE
                if (formData.type === 'expense' && formData.paymentMethod === 'credit') {
                    if (!formData.selectedCardId) {
                        alert('Selecione o cartão de crédito.');
                        setLoading(false);
                        return;
                    }

                    const numInstallments = parseInt(formData.installments) || 1;
                    const totalAmount = parseFloat(formData.amount);
                    const installmentAmount = totalAmount / numInstallments;
                    const selectedCard = creditCards.find(c => c.id === formData.selectedCardId);

                    // 1. Create N Transactions (Future Dated)
                    const baseDate = new Date(formData.date);

                    for (let i = 0; i < numInstallments; i++) {
                        const installmentDate = new Date(baseDate);
                        installmentDate.setMonth(baseDate.getMonth() + i);

                        // Adjust if day overflow (e.g. Jan 31 -> Feb 28)
                        if (installmentDate.getDate() !== baseDate.getDate()) {
                            installmentDate.setDate(0);
                        }

                        const transactionData = {
                            descricao: `${formData.description} (${i + 1}/${numInstallments})`,
                            description: `${formData.description} (${i + 1}/${numInstallments})`,
                            valor: installmentAmount,
                            type: 'expense',
                            categoria: formData.category || 'Outros',
                            category: formData.category || 'Outros',
                            date: installmentDate.toISOString().split('T')[0],
                            data: installmentDate,
                            status: 'pendente', // Credit card purchases are "pending" on the bill until paid? Or "pago" on the card but bill is pending? Usually "confirmed" in a sense. Let's keep 'pendente' as 'to be paid via bill'.
                            origem: context === 'consolidado' ? 'empresa' : context,
                            banco: selectedCard?.nome || 'Cartão de Crédito',
                            accountId: null, // No bank account affected yet
                            creditCardId: selectedCard?.id, // Link to card
                            metodo: 'credit',
                            metodoPagamento: 'credit',
                            parcelas: numInstallments,
                            parcelaAtual: i + 1,
                            cliente: formData.clientName || 'Cliente',
                            servico: formData.category
                        };

                        // Add each installment
                        addLocalTransaction({ id: Date.now() + i, ...transactionData });
                    }

                    // 2. Update Credit Card Limit (Full Amount)
                    if (selectedCard) {
                        // We increase the 'faturaAtual' or 'usedLimit'.
                        // Ideally we track 'usedLimit' separately. 
                        // For now, let's assume 'faturaAtual' holds the CURRENT month balance + any outstanding installments? 
                        // Actually, 'faturaAtual' usually means "Amount to pay THIS month".
                        // If we want "Limit Available", we should probably update a `saldoDevedor` or reduce `limite` directly if `limiteDisponivel` isn't a computed field.
                        // Let's rely on 'faturaAtual' absorbing the *current* installment, and maybe we need a way to block the rest of the limit.
                        // User request: "comprou desconta do limite do cartao o valor" (TOTAL value).

                        // Let's update `faturaAtual` with just the FIRST installment (if it falls in this month/cycle) OR simply treat 'faturaAtual' as 'Total Used Limit' for the sake of the bar? 
                        // No, 'Fatura Atual' is displayed as "Total da Fatura".

                        // FIX: To correctly reduce limit without messing up "Bill Amount", we might need a separate field `comprasParceladas` or simply accept that `limiteDisponivel` in the UI needs to be: `Limit - (Bill + FutureInstallments)`.
                        // For this iteration, I'll update a `usedLimit` property on the card if possible, OR just update `faturaAtual` with the *Total* and let the system treat it as "Total Debt".
                        // BUT, if I update `faturaAtual` with TOTAL, then the user thinks they have to pay the TOTAL now.

                        // BEST APPROXIMATION for now without changing Data Model deeply:
                        // Find the card and update `faturaAtual` += Installment 1 (so it appears on bill).
                        // AND update `limite` -= (Total - Installment 1)? No, that changes the CONTRACT limit.
                        // 
                        // Let's implement a `consumedLimit` field.
                        const currentConsumed = selectedCard.consumedLimit || selectedCard.faturaAtual || 0;
                        updateCreditCard(selectedCard.id, {
                            consumedLimit: currentConsumed + totalAmount,
                            // We can also add specifically the first installment to 'faturaAtual' if we want it to show up as "Due Now"
                            faturaAtual: (selectedCard.faturaAtual || 0) + installmentAmount
                        });
                    }

                } else {
                    // BASE CASE (Not a credit card expense)
                    const transactionData = {
                        descricao: formData.description,
                        description: formData.description,
                        valor: parseFloat(formData.amount),
                        type: formData.type,
                        categoria: formData.category || 'Outros',
                        category: formData.category || 'Outros',
                        date: formData.date,
                        data: new Date(formData.date),
                        dataVencimento: new Date(formData.date),
                        status: formData.status,
                        origem: context === 'consolidado' ? 'empresa' : context,
                        banco: financialAccounts.find(a => a.id === formData.bankAccountId)?.nome || 'Caixa',
                        accountId: formData.bankAccountId, // CRITICAL: Required for balance update
                        metodo: formData.paymentMethod,
                        metodoPagamento: formData.paymentMethod,
                        parcelas: formData.paymentMethod === 'credit' ? parseInt(formData.installments) : 1,
                        cliente: formData.clientName || 'Cliente',
                        servico: formData.category
                    };

                    if (isEditing) {
                        updateLocalTransaction(initialTransaction.id, transactionData);
                    } else {
                        addLocalTransaction({ id: Date.now(), ...transactionData });
                    }
                }
            }

            if (onSuccess) {
                onSuccess();
            }

            if (!isEditing) {
                setFormData({
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'pago',
                    clientId: '',
                    clientName: '',
                    bankAccountId: '',
                    paymentMethod: 'pix',
                    installments: '1',
                    selectedCardId: '',
                    destinationAccountId: '',
                    isRecurrent: false
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error submitting transaction:', error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
            {/* Type Selection */}
            <div className="grid grid-cols-5 gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                    className={`p-3 text-center rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${formData.type === 'income'
                        ? 'border-success bg-success/10 text-success font-bold'
                        : 'border-border hover:border-success/50 text-muted-foreground'
                        }`}
                >
                    <ArrowUpCircle className="w-5 h-5" />
                    <span className="text-xs">Entrada</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                    className={`p-3 text-center rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${formData.type === 'expense'
                        ? 'border-destructive bg-destructive/10 text-destructive font-bold'
                        : 'border-border hover:border-destructive/50 text-muted-foreground'
                        }`}
                >
                    <ArrowDownCircle className="w-5 h-5" />
                    <span className="text-xs">Saída</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'card_payment' }))}
                    className={`p-3 text-center rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${formData.type === 'card_payment'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-500 font-bold'
                        : 'border-border hover:border-purple-500/50 text-muted-foreground'
                        }`}
                >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Pagar Cartão</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'pro_labore' }))}
                    className={`p-3 text-center rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${formData.type === 'pro_labore'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-bold'
                        : 'border-border hover:border-blue-500/50 text-muted-foreground'
                        }`}
                >
                    <Briefcase className="w-5 h-5" />
                    <span className="text-xs">Pro-Labore</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'transfer' }))}
                    className={`p-3 text-center rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${formData.type === 'transfer'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500 font-bold'
                        : 'border-border hover:border-orange-500/50 text-muted-foreground'
                        }`}
                >
                    <ArrowRightLeft className="w-5 h-5" />
                    <span className="text-xs">Transferir</span>
                </button>
            </div>

            {formData.type === 'transfer' ? (
                // --- TRANSFER FORM ---
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20 text-center">
                        <p className="text-sm text-orange-200">
                            Transferência entre contas.<br />
                            Gera uma saída na origem e uma entrada no destino.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>De (Origem)</Label>
                            <Select
                                value={formData.bankAccountId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, bankAccountId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Conta Saída" />
                                </SelectTrigger>
                                <SelectContent>
                                    {financialAccounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.nome} ({acc.origem === 'empresa' ? 'PJ' : 'PF'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Para (Destino)</Label>
                            <Select
                                value={formData.destinationAccountId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, destinationAccountId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Conta Entrada" />
                                </SelectTrigger>
                                <SelectContent>
                                    {financialAccounts.filter(a => a.id !== formData.bankAccountId).map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.nome} ({acc.origem === 'empresa' ? 'PJ' : 'PF'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                    </div>
                </div>
            ) : formData.type === 'pro_labore' ? (
                // --- PRO-LABORE FORM ---
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                        <p className="text-sm text-blue-200">
                            Registrar retirada de Pro-Labore.<br />
                            Será lançado como despesa na categoria "Pro-Labore".
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Pro-Labore Augusto"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Conta de Saída</Label>
                        <Select
                            value={formData.bankAccountId}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, bankAccountId: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a conta" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAccounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.nome} - {acc.banco || 'Caixa'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                    </div>
                </div>
            ) : formData.type === 'card_payment' ? (
                // --- CARD PAYMENT FORM ---
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
                        <p className="text-sm text-purple-200">
                            Registrar pagamento de fatura.<br />
                            Isso reduzirá o saldo da conta selecionada e liberará o limite do cartão.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Cartão a Pagar</Label>
                        <Select
                            value={formData.selectedCardId}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, selectedCardId: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o cartão" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCreditCards.map(card => (
                                    <SelectItem key={card.id} value={card.id}>
                                        {card.nome} (Fatura: R$ {card.faturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor Pago (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Conta de Pagamento</Label>
                        <Select
                            value={formData.bankAccountId}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, bankAccountId: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a conta de origem" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAccounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.nome} - {acc.banco || 'Caixa'} (Saldo: R$ {acc.saldoAtual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data do Pagamento</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                    </div>
                </div>
            ) : (
                // --- STANDARD TRANSACTION FORM ---
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Pagamento Fornecedor"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Gerencie categorias na página de Carteiras
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pago">Confirmado</SelectItem>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="vencido">Vencido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, paymentMethod: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map(method => (
                                    <SelectItem key={method.id} value={method.id}>
                                        <div className="flex items-center gap-2">
                                            {method.icon}
                                            {method.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.paymentMethod === 'credit' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="creditCard">Cartão de Crédito</Label>
                                <Select
                                    value={formData.selectedCardId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, selectedCardId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o cartão" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCreditCards.map(card => (
                                            <SelectItem key={card.id} value={card.id}>
                                                {card.nome} (Disp: R$ {((card.limite || 0) - (card.faturaAtual || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="installments">Parcelas</Label>
                                <Input
                                    id="installments"
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={formData.installments}
                                    onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))}
                                />
                            </div>
                        </>
                    )}

                    {formData.paymentMethod !== 'credit' && (
                        <div className="space-y-2">
                            <Label htmlFor="bankAccount">Conta / Banco</Label>
                            <Select
                                value={formData.bankAccountId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, bankAccountId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableAccounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.nome} - {acc.banco || 'Caixa'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            <SheetFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Atualizar' : 'Salvar'} Lançamento
                </Button>
            </SheetFooter>
        </form>
    );
}
