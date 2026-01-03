"use client"

import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function AccountForm({ onSuccess }) {
    const { context } = useFinancialContext();
    const { addAccount, loading } = useAccounts(context);
    const [formData, setFormData] = useState({
        name: '',
        type: 'banco', // banco, carteira, investimento
        balance: '',
        bank: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        await addAccount({
            nome: formData.name,
            tipo: formData.type,
            saldoAtual: parseFloat(formData.balance || '0'),
            banco: formData.bank,
            origem: context === 'consolidado' ? 'empresa' : context
        });

        setFormData({
            name: '',
            type: 'banco',
            balance: '',
            bank: '',
        });

        if (onSuccess) onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                    id="name"
                    placeholder="Ex: Conta Principal"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                />
            </div>

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
                        <SelectItem value="banco">Conta Bancária</SelectItem>
                        <SelectItem value="investimento">Conta de Investimento</SelectItem>
                        <SelectItem value="carteira">Carteira Física / Digital</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bank">Instituição (Opcional)</Label>
                <Input
                    id="bank"
                    placeholder="Ex: Itaú, Nubank"
                    value={formData.bank}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank: e.target.value }))}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="balance">Saldo Inicial (R$)</Label>
                <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                />
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
