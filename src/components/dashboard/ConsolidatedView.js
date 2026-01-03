import { Building2, User, ArrowRight, Wallet } from 'lucide-react';
import {
    companyRevenues,
    personalRevenues,
    companyExpenses,
    personalExpenses,
    transfers,
    financialAccounts,
    investments,
    formatCurrency
} from '@/data/mockData';

export function ConsolidatedView() {
    // Company metrics
    const companyRevenueTotal = companyRevenues.reduce((sum, r) => sum + r.valor, 0);
    const companyExpenseTotal = companyExpenses.reduce((sum, e) => sum + e.valor, 0);
    const companyProfit = companyRevenueTotal - companyExpenseTotal;

    // Personal metrics
    const personalRevenueTotal = personalRevenues.reduce((sum, r) => sum + r.valor, 0);
    const personalExpenseTotal = personalExpenses.reduce((sum, e) => sum + e.valor, 0);
    const personalBalance = personalRevenueTotal - personalExpenseTotal;

    // Transfers
    const totalTransfers = transfers.reduce((sum, t) => sum + t.valor, 0);

    // Total patrimony
    const allAccountsTotal = financialAccounts.reduce((sum, a) => sum + a.saldoAtual, 0);
    const allInvestmentsTotal = investments.reduce((sum, i) => sum + i.valorAtual, 0);
    const totalPatrimony = allAccountsTotal + allInvestmentsTotal;

    // Financial independence
    const monthlyPersonalCost = personalExpenseTotal;
    const monthsCompanyCanSustain = monthlyPersonalCost > 0 ? companyProfit / monthlyPersonalCost : 0;

    return (
        <div className="space-y-6">
            {/* Flow between company and personal */}
            <div className="glass-card rounded-xl p-6 animate-slide-up">
                <h3 className="text-lg font-semibold text-foreground mb-6">Fluxo Financeiro</h3>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Company */}
                    <div className="flex-1 w-full bg-primary/5 border border-primary/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Empresa</p>
                                <p className="text-xs text-muted-foreground">Lucro mensal</p>
                            </div>
                        </div>
                        <p className="text-2xl font-bold kpi-value">{formatCurrency(companyProfit)}</p>
                    </div>

                    {/* Arrow with transfers */}
                    <div className="flex flex-col items-center">
                        <div className="bg-secondary rounded-full p-2 rotate-90 md:rotate-0">
                            <ArrowRight className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-center">Transferências</p>
                        <p className="text-sm font-medium text-foreground">{formatCurrency(totalTransfers)}</p>
                    </div>

                    {/* Personal */}
                    <div className="flex-1 w-full bg-accent/5 border border-accent/20 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-highlight" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Pessoal</p>
                                <p className="text-xs text-muted-foreground">Saldo mensal</p>
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${personalBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(personalBalance)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Patrimony */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-6 animate-slide-up col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                            <Wallet className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Patrimônio Total</p>
                            <p className="text-3xl font-bold kpi-value">{formatCurrency(totalPatrimony)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Em Contas</p>
                            <p className="text-lg font-semibold text-foreground">{formatCurrency(allAccountsTotal)}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Investido</p>
                            <p className="text-lg font-semibold text-foreground">{formatCurrency(allInvestmentsTotal)}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 animate-slide-up">
                    <p className="text-sm text-muted-foreground mb-2">Independência</p>
                    <p className="text-4xl font-bold highlight-text mb-2">
                        {monthsCompanyCanSustain.toFixed(1)}x
                    </p>
                    <p className="text-xs text-muted-foreground">
                        O lucro da empresa cobre {monthsCompanyCanSustain.toFixed(1)} vezes seu custo de vida mensal
                    </p>
                </div>
            </div>
        </div>
    );
}
