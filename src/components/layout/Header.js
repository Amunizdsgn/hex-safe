"use client"

import { useState, useEffect } from 'react';
import { Bell, Settings, PlusCircle, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { ContextSelector } from './ContextSelector';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const contextTitles = {
    empresa: 'Gestão Empresarial',
    pessoal: 'Finanças Pessoais',
    consolidado: 'Visão Consolidada',
};

const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function Header() {
    const {
        context,
        selectedMonth: globalMonth,
        selectedYear: globalYear,
        setSelectedMonth: setGlobalMonth,
        setSelectedYear: setGlobalYear,
        notifications // Get notifications from context
    } = useFinancialContext();

    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        // Clear local storage goals to prevent data leak between users
        if (typeof window !== 'undefined') {
            localStorage.removeItem('monthlyGoalEmpresa');
            localStorage.removeItem('monthlyGoalPessoal');
            localStorage.removeItem('monthlyGoalConsolidado');
        }
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Get current date in Salvador-BA timezone (UTC-3)
    const getCurrentDateBR = () => {
        const now = new Date();
        const salvadorTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bahia' }));
        return salvadorTime;
    };

    // Initialize with null to avoid hydration mismatch
    const [currentDate, setCurrentDate] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Use global state or fallback to 0/2026 if not initialized
    const selectedMonth = globalMonth ?? 0;
    const selectedYear = globalYear ?? 2026;

    // Initialize date/time on client side only
    useEffect(() => {
        const now = getCurrentDateBR();
        setCurrentDate(now);
        setCurrentTime(now);

        // Initialize global month/year if not set
        if (globalMonth === null) {
            setGlobalMonth(now.getMonth());
        }
        if (globalYear === null) {
            setGlobalYear(now.getFullYear());
        }
    }, [globalMonth, globalYear, setGlobalMonth, setGlobalYear]); // Added dependencies for useEffect

    // Update clock every second
    useEffect(() => {
        if (!currentTime) return;

        const timer = setInterval(() => {
            setCurrentTime(getCurrentDateBR());
        }, 1000);
        return () => clearInterval(timer);
    }, [currentTime]);

    const handleMonthSelect = (month) => {
        setGlobalMonth(month);
        setIsCalendarOpen(false);
    };

    const handleYearChange = (delta) => {
        setGlobalYear(selectedYear + delta);
    };

    const handleToday = () => {
        const today = getCurrentDateBR();
        setGlobalMonth(today.getMonth());
        setGlobalYear(today.getFullYear());
        setIsCalendarOpen(false);
    };

    const isCurrentMonth = currentDate ? (selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear()) : false;

    // Format time as HH:MM:SS - only if currentTime is available
    const hours = currentTime ? String(currentTime.getHours()).padStart(2, '0') : '--';
    const minutes = currentTime ? String(currentTime.getMinutes()).padStart(2, '0') : '--';
    const seconds = currentTime ? String(currentTime.getSeconds()).padStart(2, '0') : '--';

    return (
        <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border sticky top-0 z-30 w-full">
            <div className="flex items-center justify-between h-full px-6">
                {/* Left: Title + Date/Time */}
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">{contextTitles[context]}</h1>

                        {/* Month/Year Selector + Live Clock */}
                        <div className="flex items-center gap-3">
                            {/* Calendar Popover */}
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary/80 transition-all group">
                                        <Calendar className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-medium text-foreground">
                                            {monthNames[selectedMonth]} {selectedYear}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="start">
                                    {/* Year Selector */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => handleYearChange(-1)}
                                            className="p-1 rounded hover:bg-secondary transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-bold">{selectedYear}</span>
                                        <button
                                            onClick={() => handleYearChange(1)}
                                            className="p-1 rounded hover:bg-secondary transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Month Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {monthNamesShort.map((month, index) => {
                                            const isSelected = index === selectedMonth;
                                            const isCurrent = currentDate ? (index === currentDate.getMonth() && selectedYear === currentDate.getFullYear()) : false;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleMonthSelect(index)}
                                                    className={cn(
                                                        'px-3 py-2 rounded-md text-xs font-medium transition-all',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                                            : isCurrent
                                                                ? 'bg-primary/10 text-primary border border-primary/30'
                                                                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                                    )}
                                                >
                                                    {month}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            onClick={handleToday}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs"
                                        >
                                            Hoje
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Separator */}
                            <div className="h-4 w-px bg-border" />

                            {/* Live Digital Clock */}
                            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-secondary/30">
                                <Clock className="w-3 h-3 text-primary animate-pulse" />
                                <div className="flex items-center gap-0.5 font-mono text-xs font-semibold text-foreground">
                                    <span>{hours}</span>
                                    <span className="text-primary animate-pulse">:</span>
                                    <span>{minutes}</span>
                                    <span className="text-primary animate-pulse">:</span>
                                    <span className="text-muted-foreground">{seconds}</span>
                                </div>
                            </div>

                            {/* "Today" Badge (only if not current month) */}
                            {!isCurrentMonth && (
                                <button
                                    onClick={handleToday}
                                    className="px-2 py-0.5 text-[10px] rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium hover:scale-105"
                                >
                                    Voltar para Hoje
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* New Transaction Sheet - Only show in empresa and pessoal contexts */}
                    {context !== 'consolidado' && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button className="gradient-primary gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-200" size="sm">
                                    <PlusCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Novo Lançamento</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md border-l border-border/50 bg-background/80 backdrop-blur-xl">
                                <SheetHeader className="mb-6">
                                    <SheetTitle className="text-2xl font-bold">Novo Lançamento</SheetTitle>
                                    <SheetDescription>
                                        Registre uma receita ou despesa no fluxo de caixa.
                                    </SheetDescription>
                                </SheetHeader>
                                <TransactionForm onSuccess={() => { }} />
                            </SheetContent>
                        </Sheet>
                    )}

                    <ContextSelector />

                    {/* Notifications Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative">
                                <Bell className="w-5 h-5" />
                                {notifications && notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Notificações</span>
                                <span className="text-xs text-muted-foreground">
                                    {notifications ? notifications.length : 0} novas
                                </span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <div className="max-h-[300px] overflow-y-auto">
                                {!notifications || notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Nenhuma notificação nova
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                            <div className="flex items-center gap-2 w-full">
                                                <div className={cn("w-2 h-2 rounded-full",
                                                    notif.type === 'destructive' ? "bg-destructive" :
                                                        notif.type === 'warning' ? "bg-warning" :
                                                            "bg-success"
                                                )} />
                                                <span className="text-sm font-medium">{notif.title}</span>
                                                <span className="text-xs text-muted-foreground ml-auto">{notif.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground pl-4">{notif.message}</p>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </div>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-center text-xs text-primary cursor-pointer justify-center">
                                Ver todas as notificações
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Settings Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Configurações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <Calendar className="w-4 h-4 mr-2" />
                                Preferências de Data
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Bell className="w-4 h-4 mr-2" />
                                Notificações
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                Ajuda
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
