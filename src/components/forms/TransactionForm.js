"use client"

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function TransactionForm({ onSuccess }) {
    const { context } = useFinancialContext();
    const { addTransaction, loading } = useTransactions(context);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense', // 'income' or 'expense'
        category: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pago' // 'pago', 'pendente', 'vencido'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.description || !formData.amount) return;

        await addTransaction({
            descricao: formData.description,
            valor: parseFloat(formData.amount),
            type: formData.type,
            categoria: formData.category,
            data: new Date(formData.date),
            status: formData.status,
            origem: context === 'consolidado' ? 'empresa' : context // Default to context
        });

        // Reset
        setFormData({
            description: '',
            amount: '',
            type: 'expense',
            category: '',
            date: new Date().toISOString().split('T')[0],
            status: 'pago'
        });

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                        <SelectItem value="Serviços">Serviços</SelectItem>
                        <SelectItem value="Vendas">Vendas</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                        <SelectItem value="Pessoal">Pessoal</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
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

            <div className="space-y-2">
                <Label>Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pago">Pago / Recebido</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <SheetFooter className="mt-6">
                <SheetClose asChild>
                    <Button variant="ghost" type="button">Cancelar</Button>
                </SheetClose>
                <Button type="submit" disabled={loading} className="gradient-primary">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Salvar
                </Button>
            </SheetFooter>
        </form>
    );
}
