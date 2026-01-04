"use client"

import { useState } from 'react';
import { TrendingUp, Lock, Zap, Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { formatCurrency, formatPercent, portfolioHistory, currencyRates, assetOperations } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InvestmentAlerts } from '@/components/dashboard/investments/InvestmentAlerts';
import { InvestmentGoals } from '@/components/dashboard/investments/InvestmentGoals';
import { ComparativeChart } from '@/components/dashboard/investments/ComparativeChart';
import { RiskAnalysis } from '@/components/dashboard/investments/RiskAnalysis';
import { CurrencyModule } from '@/components/dashboard/investments/CurrencyModule';
import { OperationalHistory } from '@/components/dashboard/investments/OperationalHistory';
import { AdvancedMetrics } from '@/components/dashboard/investments/AdvancedMetrics';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { InvestmentForm } from '@/components/forms/InvestmentForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Reuse existing charts logic where applicable
const typeLabels = {
    renda_fixa: 'Renda Fixa',
    renda_variavel: 'Renda Variável',
    cripto: 'Cripto',
    fundo: 'Fundos',
    outro: 'Outros',
};

const liquidityLabels = {
    imediata: 'Imediata',
    curto_prazo: 'Curto Prazo',
    longo_prazo: 'Longo Prazo',
};

const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B', '#007A7D'];

export default function InvestmentsPage() {
    const { context, investments, addInvestment, updateInvestment, removeInvestment } = useFinancialContext();
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'carteira', 'analise'
    const [timeFrame, setTimeFrame] = useState('YTD'); // 7d, 30d, 90d, YTD, ALL
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [investmentToDelete, setInvestmentToDelete] = useState(null);

    // Filter Investments
    const filteredInvestments = context === 'consolidado'
        ? investments
        : investments.filter(i => i.origem === context);

    const totalInvested = filteredInvestments.reduce((sum, i) => sum + (i.valorAplicado || 0), 0);
    const totalCurrent = filteredInvestments.reduce((sum, i) => sum + (i.valorAtual || 0), 0);
    const totalReturn = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? ((totalReturn / totalInvested) * 100) : 0;
    const immediateTotal = filteredInvestments.filter(i => i.liquidez === 'imediata').reduce((sum, i) => sum + i.valorAtual, 0);

    // Grouping Logic for Charts
    const byType = filteredInvestments.reduce((acc, inv) => {
        const key = inv.tipo;
        if (!acc[key]) acc[key] = { aplicado: 0, atual: 0 };
        acc[key].aplicado += (inv.valorAplicado || 0);
        acc[key].atual += (inv.valorAtual || 0);
        return acc;
    }, {});

    const typeData = Object.entries(byType).map(([tipo, values]) => ({
        name: typeLabels[tipo] || tipo,
        value: values.atual,
    }));

    const byLiquidity = filteredInvestments.reduce((acc, inv) => {
        const key = inv.liquidez;
        if (!acc[key]) acc[key] = 0;
        acc[key] += inv.valorAtual;
        return acc;
    }, {});

    const liquidityData = Object.entries(byLiquidity).map(([liq, value]) => ({
        name: liquidityLabels[liq] || liq,
        value,
    }));

    // Tabs Navigation
    const tabs = [
        { id: 'dashboard', label: 'Visão Geral' },
        { id: 'carteira', label: 'Minha Carteira' },
        { id: 'analise', label: 'Análise & Estratégia' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Investimentos</h2>
                    <p className="text-muted-foreground">
                        {context === 'consolidado' ? 'Gestão estratégica de patrimônio' : 'Portfólio de investimentos'}
                    </p>
                </div>

                <div className="flex items-center gap-4 self-start md:self-auto">
                    <div className="flex bg-secondary p-1 rounded-lg">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setViewMode(tab.id)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                    viewMode === tab.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => setIsSheetOpen(true)} className="gradient-primary">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Novo Aporte
                    </Button>
                </div>
            </div>

            {/* Global Summary Cards (Visible always or just in Dashboard?) -> Keeps helpful context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5 border-primary/30 glow-primary bg-primary/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Patrimônio Investido</p>
                            <p className="text-2xl font-bold kpi-value">{formatCurrency(totalCurrent)}</p>
                        </div>
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-5 border-success/30 bg-success/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Rentabilidade Total</p>
                            <p className="text-2xl font-bold text-success">+{formatPercent(returnPercentage)}</p>
                        </div>
                        <div className="p-2 bg-success/20 rounded-lg text-success">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Liquidez Imediata</p>
                            <p className="text-2xl font-bold highlight-text">{formatCurrency(immediateTotal)}</p>
                        </div>
                        <div className="p-2 bg-secondary rounded-lg text-foreground">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Posições Ativas</p>
                            <p className="text-2xl font-bold kpi-value">{filteredInvestments.length}</p>
                        </div>
                        <div className="p-2 bg-secondary rounded-lg text-foreground">
                            <Lock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <InvestmentAlerts investments={filteredInvestments} />

            {/* View Content */}
            {viewMode === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <ComparativeChart data={portfolioHistory} />
                            <CurrencyModule rates={currencyRates} />
                        </div>
                        <div className="space-y-6">
                            <InvestmentGoals currentAmount={totalCurrent} />
                            <RiskAnalysis investments={filteredInvestments} />
                        </div>
                    </div>
                    <AdvancedMetrics />
                </div>
            )}

            {viewMode === 'carteira' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Meus Ativos</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Buscar ativo..." className="pl-9 w-[200px]" />
                            </div>
                            <Button variant="outline" size="icon"><SlidersHorizontal className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="glass-card rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/30 border-b border-border">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ativo</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor Atual</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rentabilidade</th>
                                        <th className="text-center px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liq.</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredInvestments.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-secondary/20 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-foreground">{inv.ativo}</p>
                                                    <p className="text-xs text-muted-foreground">{typeLabels[inv.tipo]}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {inv.tags?.map(tag => (
                                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                    {!inv.tags?.length && <span className="text-xs text-muted-foreground">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-foreground">
                                                {formatCurrency(inv.valorAtual)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn(
                                                    'text-sm font-medium',
                                                    inv.rentabilidadePercentual >= 0 ? 'text-success' : 'text-destructive'
                                                )}>
                                                    {inv.rentabilidadePercentual >= 0 ? '+' : ''}{formatPercent(inv.rentabilidadePercentual)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs text-muted-foreground">
                                                {liquidityLabels[inv.liquidez] || inv.liquidez}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => {
                                                            setEditingInvestment(inv);
                                                            setIsSheetOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => setInvestmentToDelete(inv.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <OperationalHistory history={assetOperations} />
                </div>
            )}

            <Sheet open={isSheetOpen} onOpenChange={(open) => {
                if (!open) setEditingInvestment(null);
                setIsSheetOpen(open);
            }}>
                <SheetContent>
                    <SheetHeader className="mb-6">
                        <SheetTitle>{editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}</SheetTitle>
                        <SheetDescription>
                            {editingInvestment ? 'Atualize os dados do seu investimento.' : 'Cadastre um novo aporte ou ativo.'}
                        </SheetDescription>
                    </SheetHeader>
                    <InvestmentForm
                        initialData={editingInvestment}
                        onSubmit={(data) => {
                            if (editingInvestment) {
                                updateInvestment(editingInvestment.id, data);
                            } else {
                                addInvestment(data);
                            }
                            setIsSheetOpen(false);
                            setEditingInvestment(null);
                        }}
                        onCancel={() => {
                            setIsSheetOpen(false);
                            setEditingInvestment(null);
                        }}
                    />
                </SheetContent>
            </Sheet>

            <AlertDialog open={!!investmentToDelete} onOpenChange={(open) => !open && setInvestmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Investimento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                removeInvestment(investmentToDelete);
                                setInvestmentToDelete(null);
                            }}
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {viewMode === 'analise' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-6">Alocação por Tipo</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                        {typeData.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0B1111', borderRadius: '8px', border: '1px solid #333' }} formatter={(value) => [formatCurrency(value), '']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {typeData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                    <span className="text-xs text-muted-foreground">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-6">Alocação por Liquidez</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={liquidityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3333" horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000)}k`} />
                                    <YAxis type="category" dataKey="name" stroke="#9CB0B1" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0B1111', borderRadius: '8px', border: '1px solid #333' }} formatter={(value) => [formatCurrency(value), '']} />
                                    <Bar dataKey="value" fill="#01B8BE" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
