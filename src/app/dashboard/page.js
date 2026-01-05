"use client"

import { useFinancialContext } from '@/contexts/FinancialContext';
import { ConsolidatedView } from '@/components/dashboard/ConsolidatedView';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { ServiceRevenueChart } from '@/components/dashboard/ServiceRevenueChart';
import { ChannelChart } from '@/components/dashboard/ChannelChart';
import { AccountsOverview } from '@/components/dashboard/AccountsOverview';
import { InvestmentSummary } from '@/components/dashboard/InvestmentSummary';
import { PersonalExpenseChart } from '@/components/dashboard/PersonalExpenseChart';
import { FinancialSecurityCard } from '@/components/dashboard/FinancialSecurityCard';
import { ProjectFinancialsSummary } from '@/components/dashboard/ProjectFinancialsSummary';
import { DollarSign, TrendingUp, TrendingDown, Percent, Target, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

export default function DashboardPage() {
  const { transactions, context, clients, selectedMonth, selectedYear } = useFinancialContext();

  // --- GOAL STATE ---
  const [monthlyGoal, setMonthlyGoal] = useState(80000);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getGoal = () => {
        if (context === 'consolidado') {
          const empresaGoal = Number(localStorage.getItem('monthlyGoalEmpresa')) || 80000;
          const pessoalGoal = Number(localStorage.getItem('monthlyGoalPessoal')) || 20000;
          return empresaGoal + pessoalGoal;
        }

        const key = context === 'pessoal' ? 'monthlyGoalPessoal' : 'monthlyGoalEmpresa';
        return Number(localStorage.getItem(key)) || (context === 'pessoal' ? 20000 : 80000);
      };

      setMonthlyGoal(getGoal());
    }
  }, [context]);


  // --- DYNAMIC CALCULATIONS ---

  // Filter transactions by context
  const contextTransactions = useMemo(() => {
    if (context === 'consolidado') return transactions;

    return transactions.filter(t => {
      // Fallback: if no origem field, assume 'empresa' (legacy)
      const transactionOrigem = t.origem || 'empresa';

      // Treat 'conta' as 'empresa' (legacy)
      if (transactionOrigem === 'conta') return context === 'empresa';

      return transactionOrigem === context;
    });
  }, [transactions, context]);

  // Current Month Transactions
  const currentMonthTransactions = useMemo(() => {
    return contextTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [contextTransactions, selectedMonth, selectedYear]);

  // Revenue (Receita)
  const revenue = useMemo(() => {
    return currentMonthTransactions
      .filter(t => ['revenue', 'receita', 'income'].includes(t.type) && t.status === 'pago')
      .reduce((sum, r) => sum + Number(r.valor), 0);
  }, [currentMonthTransactions]);

  // Expenses (Despesas)
  const expenses = useMemo(() => {
    return currentMonthTransactions
      .filter(t => ['expense', 'despesa', 'saida'].includes(t.type) && t.status === 'pago')
      .reduce((sum, e) => sum + Number(e.valor), 0);
  }, [currentMonthTransactions]);

  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const goalDifference = revenue - monthlyGoal;

  // Overdue transactions
  const overdueTransactions = useMemo(() => {
    return contextTransactions.filter(t =>
      ['expense', 'despesa', 'saida'].includes(t.type) && t.status === 'vencido'
    );
  }, [contextTransactions]);

  const overdueTotal = overdueTransactions.reduce((sum, e) => sum + Number(e.valor), 0);


  // Personal-specific calculations (only when in pessoal context)
  const fixedExpenses = useMemo(() => {
    if (context !== 'pessoal' && context !== 'consolidado') return 0;
    return currentMonthTransactions
      .filter(t => ['expense', 'despesa', 'saida', 'card_payment'].includes(t.type) && t.recorrente && t.status === 'pago')
      .reduce((sum, e) => sum + Number(e.valor), 0);
  }, [currentMonthTransactions, context]);

  const variableExpenses = useMemo(() => {
    if (context !== 'pessoal' && context !== 'consolidado') return 0;
    return currentMonthTransactions
      .filter(t => ['expense', 'despesa', 'saida', 'card_payment'].includes(t.type) && !t.recorrente && t.status === 'pago')
      .reduce((sum, e) => sum + Number(e.valor), 0);
  }, [currentMonthTransactions, context]);


  // 3. Chart Data Preparation
  // Revenue vs Expenses (Last 6 months logic could be added, but for now let's use the mock monthlyData style but calculated if possible, 
  // or just filter current month for simplicity? 
  // "RevenueExpenseChart" expects an array. Let's generate a quick 6-month history from transactions.)

  const historyData = useMemo(() => {
    const last6Months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });

      const monthTx = contextTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });

      const rev = monthTx.filter(t => ['revenue', 'receita', 'income'].includes(t.type)).reduce((s, t) => s + Number(t.valor), 0);
      const exp = monthTx.filter(t => ['expense', 'despesa', 'saida'].includes(t.type)).reduce((s, t) => s + Number(t.valor), 0);

      last6Months.push({ month: monthName, receita: rev, despesa: exp });
    }
    return last6Months;
  }, [contextTransactions]);


  // 4. Channel Data (Dynamic)
  // We can try to infer channel from Client Acquisition if we link transactions to clients, 
  // but transactions often don't have client_id linked in this simple app yet.
  // Fallback: Use Client LTV or Client Last Purchase sum grouped by Channel? 
  // Better: Use Clients' internalData/revenue if available?
  // Let's use Clients Active + Deals Won Value grouped by Channel as a proxy for "Revenue Potential by Channel" 
  // OR simply map transactions with a "Category" that matches a channel? No.
  // Let's use the Clients list. Sum up `ltv` (Lifetime Value) or `internalData.contract.value` for Active clients by Channel.

  const channelData = useMemo(() => {
    if (!clients) return [];
    const map = {};
    clients.forEach(c => {
      if (c.status === 'Ativo') {
        const channel = c.acquisitionChannel || 'Outros';
        // Value: Use LTV or Recurring Value * 12? Let's use LTV + Project Values.
        // Simplest: Just count or sum estimated recurring.
        // Let's sum `c.internalData?.contract?.value` (Monthly)
        const val = Number(c.internalData?.contract?.value) || 0;
        map[channel] = (map[channel] || 0) + val;
      }
    });

    const colors = ['#01B8BE', '#00D9E0', '#A8FCFF', '#00777B', '#2C3E50', '#E74C3C'];
    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    })).filter(i => i.value > 0);
  }, [clients]);


  // --- RENDER ---

  if (context === 'consolidado') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">Visão Consolidada</h2>
          <p className="text-muted-foreground">Patrimônio total e fluxo entre empresa e pessoal</p>
        </div>
        <ConsolidatedView />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvestmentSummary />
          <AccountsOverview />
        </div>
      </div>
    );
  }

  if (context === 'pessoal') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">Dashboard Pessoal</h2>
          <p className="text-muted-foreground">Controle financeiro pessoal e reservas</p>
        </div>

        {/* Personal KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Renda Total"
            value={formatCurrency(revenue)}
            trend={0}
            trendLabel="Mês Atual"
            icon={<DollarSign className="w-5 h-5" />}
            variant="highlight"
          />
          <KPICard
            title="Despesas Fixas"
            value={formatCurrency(fixedExpenses)}
            subtitle="Recorrentes"
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <KPICard
            title="Despesas Variáveis"
            value={formatCurrency(variableExpenses)}
            subtitle="Não recorrentes"
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <KPICard
            title="Sobra Mensal"
            value={formatCurrency(revenue - fixedExpenses - variableExpenses)}
            subtitle={revenue > 0 ? `${((1 - (fixedExpenses + variableExpenses) / revenue) * 100).toFixed(1)}% disponível` : '0% disponível'}
            icon={<TrendingUp className="w-5 h-5" />}
            variant={(revenue - fixedExpenses - variableExpenses) >= 0 ? 'success' : 'danger'}
          />
        </div>


        {/* Charts and Security */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalExpenseChart />
          <FinancialSecurityCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvestmentSummary />
          <AccountsOverview />
        </div>
      </div>
    );
  }

  // Company View (Default)
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Executivo</h2>
        <p className="text-muted-foreground">Visão geral do desempenho da empresa</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Receita Realizada"
          value={formatCurrency(revenue)}
          trend={0} // To be calculated vs last month real data if desired
          trendLabel="Mês Atual"
          icon={<DollarSign className="w-5 h-5" />}
          variant="highlight"
        />
        <KPICard
          title="Despesas Realizadas"
          value={formatCurrency(expenses)}
          trend={0}
          trendLabel="Mês Atual"
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(profit)}
          subtitle={profit >= 0 ? "Positivo" : "Negativo"}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <KPICard
          title="Margem de Lucro"
          value={`${profitMargin.toFixed(1)}%`}
          subtitle="Do faturamento"
          icon={<Percent className="w-5 h-5" />}
        />
        <KPICard
          title="Meta Mensal"
          value={formatCurrency(monthlyGoal)}
          subtitle={goalDifference >= 0 ? `+${formatCurrency(goalDifference)}` : formatCurrency(goalDifference)}
          icon={<Target className="w-5 h-5" />}
          variant={goalDifference >= 0 ? 'success' : 'warning'}
        />
        <KPICard
          title="Contas Vencidas"
          value={overdueTransactions.length.toString()}
          subtitle={formatCurrency(overdueTotal)}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={overdueTransactions.length > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueExpenseChart data={historyData} />
        {/* Swapped ServiceRevenueChart for Project widget if relevant, or keep underneath */}
        <ProjectFinancialsSummary />
      </div>

      {/* Secondary Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Channel Chart */}
        <ChannelChart data={channelData} />
        <AccountsOverview />
        <InvestmentSummary />
      </div>
    </div>
  );
}
