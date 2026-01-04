"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetFooter } from '@/components/ui/sheet';
import { Loader2, Calendar, DollarSign } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function RecurringExpenseForm({ onSuccess, initialExpense }) {
    const { context, addRecurringExpense, updateRecurringExpense, expenseCategories, accounts } = useFinancialContext();
    const [loading, setLoading] = useState(false);

    const isEditing = !!initialExpense;

    const [formData, setFormData] = useState({
        descricao: initialExpense?.descricao || '',
        categoria: initialExpense?.categoria || '',
        valor_estimado: initialExpense?.valor_estimado?.toString() || '',
        dia_vencimento: initialExpense?.dia_vencimento?.toString() || '1',
        metodo_pagamento: initialExpense?.metodo_pagamento || 'pix',
        conta_id: initialExpense?.conta_id || '',
        origem: initialExpense?.origem || (context === 'consolidado' ? 'pessoal' : context)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.descricao || !formData.valor_estimado) {
            alert('Preencha descrição e valor estimado');
            return;
        }

        setLoading(true);

        try {
            const expenseData = {
                descricao: formData.descricao,
                categoria: formData.categoria || 'Outros',
                valor_estimado: parseFloat(formData.valor_estimado),
                dia_vencimento: parseInt(formData.dia_vencimento),
                metodo_pagamento: formData.metodo_pagamento,
                conta_id: formData.conta_id || null,
                origem: formData.origem
            };

            if (isEditing) {
                await updateRecurringExpense(initialExpense.id, expenseData);
            } else {
                await addRecurringExpense(expenseData);
            }

            if (onSuccess) {
                onSuccess();
            }

            // Reset form if creating new
            if (!isEditing) {
                setFormData({
                    descricao: '',
                    categoria: '',
                    valor_estimado: '',
                    dia_vencimento: '1',
                    metodo_pagamento: 'pix',
                    conta_id: '',
                    origem: context === 'consolidado' ? 'pessoal' : context
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error saving recurring expense:', error);
            alert('Erro ao salvar despesa recorrente');
            setLoading(false);
        }
    };

    // Filter accounts by origem
    const availableAccounts = accounts.filter(acc => {
        if (context === 'consolidado') {
            return acc.origem === formData.origem;
        }
        return acc.origem === context;
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-primary">
                        {isEditing ? 'Editar' : 'Nova'} Despesa Recorrente
                    </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                    Será gerada automaticamente todo mês no dia especificado
                </p>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                    id="descricao"
                    placeholder="Ex: Conta de Luz"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    required
                />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                    value={formData.categoria}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, categoria: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {expenseCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Valor Estimado */}
            <div className="space-y-2">
                <Label htmlFor="valor">Valor Estimado (R$) *</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.valor_estimado}
                        onChange={(e) => setFormData(prev => ({ ...prev, valor_estimado: e.target.value }))}
                        className="pl-10"
                        required
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Você poderá editar o valor real antes de pagar
                </p>
            </div>

            {/* Dia do Vencimento */}
            <div className="space-y-2">
                <Label htmlFor="dia">Dia do Vencimento *</Label>
                <Select
                    value={formData.dia_vencimento}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, dia_vencimento: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                                Dia {day}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2">
                <Label htmlFor="metodo">Método de Pagamento</Label>
                <Select
                    value={formData.metodo_pagamento}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, metodo_pagamento: val }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="debit">Débito Automático</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="money">Dinheiro</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Conta */}
            {availableAccounts.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="conta">Conta (Opcional)</Label>
                    <Select
                        value={formData.conta_id || 'none'}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, conta_id: val === 'none' ? '' : val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {availableAccounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.nome} - {acc.banco || 'Caixa'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <SheetFooter className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Atualizar' : 'Cadastrar'} Despesa Recorrente
                </Button>
            </SheetFooter>
        </form>
    );
}
