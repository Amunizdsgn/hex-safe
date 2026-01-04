"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Calendar, Zap } from 'lucide-react';
import { RecurringExpenseForm } from '@/components/forms/RecurringExpenseForm';
import { RecurringExpensesList } from '@/components/dashboard/RecurringExpensesList';
import { useFinancialContext } from '@/contexts/FinancialContext';

export default function RecorrentesPage() {
    const { generatePendingRecurringExpenses, selectedMonth, selectedYear } = useFinancialContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [generating, setGenerating] = useState(false);

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingExpense(null);
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const count = await generatePendingRecurringExpenses(selectedMonth, selectedYear);
            alert(`${count} despesa(s) gerada(s) para ${selectedMonth}/${selectedYear}`);
        } catch (error) {
            console.error('Error generating:', error);
            alert('Erro ao gerar despesas');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Despesas Recorrentes</h1>
                </div>
                <p className="text-muted-foreground">
                    Gerencie despesas fixas que se repetem todo mês
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
                <Sheet open={isFormOpen} onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingExpense(null);
                }}>
                    <SheetTrigger asChild>
                        <Button className="flex-1">
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Despesa Recorrente
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>
                                {editingExpense ? 'Editar' : 'Nova'} Despesa Recorrente
                            </SheetTitle>
                        </SheetHeader>
                        <RecurringExpenseForm
                            onSuccess={handleFormSuccess}
                            initialExpense={editingExpense}
                        />
                    </SheetContent>
                </Sheet>

                <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex-1"
                >
                    <Zap className="w-4 h-4 mr-2" />
                    {generating ? 'Gerando...' : 'Gerar Despesas do Mês'}
                </Button>
            </div>

            {/* Info Card */}
            <div className="glass-card rounded-xl p-4 mb-6 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-500 mb-1">Como funciona?</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Cadastre despesas que se repetem todo mês (luz, internet, aluguel, etc)</li>
                            <li>• Clique em "Gerar Despesas do Mês" para criar lançamentos pendentes</li>
                            <li>• Edite o valor real no Fluxo de Caixa antes de marcar como pago</li>
                            <li>• Desative temporariamente despesas que não vão ocorrer</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* List */}
            <RecurringExpensesList onEdit={handleEdit} />
        </div>
    );
}
