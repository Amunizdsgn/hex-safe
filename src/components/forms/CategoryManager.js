"use client"

import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinancialContext } from '@/contexts/FinancialContext';
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
import { cn } from '@/lib/utils';

export function CategoryManager({ type = 'both', onClose }) {
    const {
        expenseCategories,
        incomeCategories,
        addExpenseCategory,
        removeExpenseCategory,
        addIncomeCategory,
        removeIncomeCategory
    } = useFinancialContext();

    const [newExpenseCategory, setNewExpenseCategory] = useState('');
    const [newIncomeCategory, setNewIncomeCategory] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null);

    const handleAddExpenseCategory = () => {
        if (newExpenseCategory.trim()) {
            addExpenseCategory(newExpenseCategory.trim());
            setNewExpenseCategory('');
        }
    };

    const handleAddIncomeCategory = () => {
        if (newIncomeCategory.trim()) {
            addIncomeCategory(newIncomeCategory.trim());
            setNewIncomeCategory('');
        }
    };

    const handleRemoveExpenseCategory = (categoryName) => {
        setCategoryToDelete(categoryName);
        setDeleteType('expense');
    };

    const handleRemoveIncomeCategory = (categoryName) => {
        setCategoryToDelete(categoryName);
        setDeleteType('income');
    };

    const confirmRemoveCategory = () => {
        if (deleteType === 'expense') {
            removeExpenseCategory(categoryToDelete);
        } else if (deleteType === 'income') {
            removeIncomeCategory(categoryToDelete);
        }
        setCategoryToDelete(null);
        setDeleteType(null);
    };

    const showExpenses = type === 'both' || type === 'expense';
    const showIncome = type === 'both' || type === 'income';

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Gerenciar Categorias</h3>
                <p className="text-sm text-muted-foreground">
                    Adicione ou remova categorias para organizar suas transações.
                </p>
            </div>

            {/* Expense Categories */}
            {showExpenses && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-destructive" />
                        </div>
                        <h4 className="font-semibold">Categorias de Despesas</h4>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newExpenseCategory">Nova Categoria de Despesa</Label>
                        <div className="flex gap-2">
                            <Input
                                id="newExpenseCategory"
                                placeholder="Ex: Fornecedores, Aluguel..."
                                value={newExpenseCategory}
                                onChange={(e) => setNewExpenseCategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddExpenseCategory()}
                            />
                            <Button onClick={handleAddExpenseCategory} size="sm" variant="destructive">
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                        {expenseCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma categoria de despesa cadastrada
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {expenseCategories.map((category) => (
                                    <div
                                        key={category}
                                        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-full hover:bg-secondary/50 transition-colors border border-destructive/20"
                                    >
                                        <Tag className="w-3 h-3 text-destructive" />
                                        <span className="text-sm font-medium">{category}</span>
                                        <button
                                            onClick={() => {
                                                setCategoryToDelete(category);
                                                setDeleteType('expense');
                                            }}
                                            className="p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remover categoria"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Income Categories */}
            {showIncome && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-success" />
                        </div>
                        <h4 className="font-semibold">Categorias de Receitas</h4>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newIncomeCategory">Nova Categoria de Receita</Label>
                        <div className="flex gap-2">
                            <Input
                                id="newIncomeCategory"
                                placeholder="Ex: Consultoria, Produtos..."
                                value={newIncomeCategory}
                                onChange={(e) => setNewIncomeCategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddIncomeCategory()}
                            />
                            <Button onClick={handleAddIncomeCategory} size="sm" className="bg-success hover:bg-success/90">
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto p-3 bg-success/5 rounded-lg border border-success/20">
                        {incomeCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma categoria de receita cadastrada
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {incomeCategories.map((category) => (
                                    <div
                                        key={category}
                                        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-full hover:bg-secondary/50 transition-colors border border-success/20"
                                    >
                                        <Tag className="w-3 h-3 text-success" />
                                        <span className="text-sm font-medium">{category}</span>
                                        <button
                                            onClick={() => {
                                                setCategoryToDelete(category);
                                                setDeleteType('income');
                                            }}
                                            className="p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remover categoria"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {onClose && (
                <Button onClick={onClose} className="w-full" variant="outline">
                    Fechar
                </Button>
            )}

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover a categoria "{categoryToDelete}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveCategory} className="bg-destructive hover:bg-destructive/90">
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
