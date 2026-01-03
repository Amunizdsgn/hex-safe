"use client"

import { Bell, Settings, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { ContextSelector } from './ContextSelector';
import { useFinancialContext } from '@/contexts/FinancialContext';

const contextTitles = {
    empresa: 'Gestão Empresarial',
    pessoal: 'Finanças Pessoais',
    consolidado: 'Visão Consolidada',
};

export function Header() {
    const { context } = useFinancialContext();

    return (
        <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border sticky top-0 z-30 w-full">
            <div className="flex items-center justify-between h-full px-6">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">{contextTitles[context]}</h1>
                    <p className="text-xs text-muted-foreground">Dezembro 2024</p>
                </div>

                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="gradient-primary gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-200" size="sm">
                                <PlusCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Nova Transação</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-background/80 backdrop-blur-xl">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="text-2xl font-bold">Nova Transação</SheetTitle>
                                <SheetDescription>
                                    Adicione uma receita ou despesa.
                                </SheetDescription>
                            </SheetHeader>
                            <TransactionForm />
                        </SheetContent>
                    </Sheet>

                    <ContextSelector />

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
