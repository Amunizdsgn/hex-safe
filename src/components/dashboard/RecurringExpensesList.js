"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { formatCurrency } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function RecurringExpensesList({ onEdit }) {
    const { recurringExpenses, deleteRecurringExpense, toggleRecurringExpense, context } = useFinancialContext();
    const [deleteId, setDeleteId] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(null);

    // Filter by context
    const filteredExpenses = context === 'consolidado'
        ? recurringExpenses
        : recurringExpenses.filter(re => re.origem === context);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteRecurringExpense(deleteId);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erro ao excluir despesa recorrente');
        }
    };

    const handleToggle = async (id, currentStatus) => {
        setToggleLoading(id);
        try {
            await toggleRecurringExpense(id, !currentStatus);
        } catch (error) {
            console.error('Error toggling:', error);
            alert('Erro ao alterar status');
        } finally {
            setToggleLoading(null);
        }
    };

    if (filteredExpenses.length === 0) {
        return (
            <div className="glass-card rounded-xl p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma despesa recorrente cadastrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Cadastre despesas fixas para gerar lançamentos automaticamente
                </p>
            </div>
        );
    }

    const activeExpenses = filteredExpenses.filter(re => re.ativo);
    const inactiveExpenses = filteredExpenses.filter(re => !re.ativo);
    const totalEstimado = activeExpenses.reduce((sum, re) => sum + Number(re.valor_estimado), 0);

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <div className="glass-card rounded-xl p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Mensal Estimado</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalEstimado)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Despesas Ativas</p>
                        <p className="text-2xl font-bold">{activeExpenses.length}</p>
                    </div>
                </div>
            </div>

            {/* Active Expenses */}
            {activeExpenses.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Ativas</h3>
                    {activeExpenses.map(expense => (
                        <div
                            key={expense.id}
                            className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-foreground">{expense.descricao}</h4>
                                        {expense.origem === 'pessoal' && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                                Pessoal
                                            </span>
                                        )}
                                        {expense.origem === 'empresa' && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                Empresa
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            <span>{formatCurrency(expense.valor_estimado)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>Dia {expense.dia_vencimento}</span>
                                        </div>
                                        <span className="text-xs">{expense.categoria}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(expense)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggle(expense.id, expense.ativo)}
                                        disabled={toggleLoading === expense.id}
                                        className="h-8 w-8 p-0"
                                    >
                                        <PowerOff className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteId(expense.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Inactive Expenses */}
            {inactiveExpenses.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Inativas</h3>
                    {inactiveExpenses.map(expense => (
                        <div
                            key={expense.id}
                            className="glass-card rounded-lg p-4 opacity-50"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground">{expense.descricao}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{formatCurrency(expense.valor_estimado)}</span>
                                        <span>Dia {expense.dia_vencimento}</span>
                                        <span className="text-xs">{expense.categoria}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggle(expense.id, expense.ativo)}
                                        disabled={toggleLoading === expense.id}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Power className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteId(expense.id)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Despesa Recorrente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A despesa recorrente será removida permanentemente.
                            Os lançamentos já gerados não serão afetados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
