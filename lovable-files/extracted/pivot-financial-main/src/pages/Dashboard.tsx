import { DollarSign, TrendingUp, TrendingDown, Target, AlertTriangle, Percent } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { ServiceRevenueChart } from '@/components/dashboard/ServiceRevenueChart';
import { ChannelChart } from '@/components/dashboard/ChannelChart';
import { AccountsOverview } from '@/components/dashboard/AccountsOverview';
import { InvestmentSummary } from '@/components/dashboard/InvestmentSummary';
import { PersonalExpenseChart } from '@/components/dashboard/PersonalExpenseChart';
import { FinancialSecurityCard } from '@/components/dashboard/FinancialSecurityCard';
import { ConsolidatedView } from '@/components/dashboard/ConsolidatedView';
import { useFinancialContext } from '@/contexts/FinancialContext';
import { 
  companyRevenues, 
  companyExpenses, 
  personalRevenues, 
  personalExpenses,
  formatCurrency 
} from '@/data/mockData';

export default function Dashboard() {
  const { context } = useFinancialContext();

  // Company KPIs
  const companyRevenue = companyRevenues.reduce((sum, r) => sum + r.valor, 0);
  const companyExpense = companyExpenses.reduce((sum, e) => sum + e.valor, 0);
  const companyProfit = companyRevenue - companyExpense;
  const profitMargin = companyRevenue > 0 ? (companyProfit / companyRevenue) * 100 : 0;
  const monthlyGoal = 80000;
  const goalDifference = companyRevenue - monthlyGoal;
  const overdueCompany = companyExpenses.filter(e => e.status === 'vencido');
  const overdueTotal = overdueCompany.reduce((sum, e) => sum + e.valor, 0);

  // Personal KPIs
  const personalRevenue = personalRevenues.reduce((sum, r) => sum + r.valor, 0);
  const fixedExpenses = personalExpenses.filter(e => e.recorrente).reduce((sum, e) => sum + e.valor, 0);
  const variableExpenses = personalExpenses.filter(e => !e.recorrente).reduce((sum, e) => sum + e.valor, 0);
  const totalPersonalExpenses = fixedExpenses + variableExpenses;
  const personalBalance = personalRevenue - totalPersonalExpenses;
  const committedPercent = personalRevenue > 0 ? (totalPersonalExpenses / personalRevenue) * 100 : 0;

  if (context === 'consolidado') {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">Dashboard Pessoal</h2>
          <p className="text-muted-foreground">Controle financeiro pessoal e reservas</p>
        </div>

        {/* Personal KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Renda Total"
            value={formatCurrency(personalRevenue)}
            trend={5.2}
            trendLabel="vs mês anterior"
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
            value={formatCurrency(personalBalance)}
            subtitle={`${(100 - committedPercent).toFixed(1)}% disponível`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant={personalBalance >= 0 ? 'success' : 'danger'}
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

  // Company Dashboard (default)
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Executivo</h2>
        <p className="text-muted-foreground">Visão geral do desempenho da empresa</p>
      </div>

      {/* Company KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Receita Total"
          value={formatCurrency(companyRevenue)}
          trend={8.5}
          trendLabel="vs mês anterior"
          icon={<DollarSign className="w-5 h-5" />}
          variant="highlight"
        />
        <KPICard
          title="Despesas Totais"
          value={formatCurrency(companyExpense)}
          trend={-2.3}
          trendLabel="vs mês anterior"
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(companyProfit)}
          trend={12.1}
          trendLabel="vs mês anterior"
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
          value={overdueCompany.length.toString()}
          subtitle={formatCurrency(overdueTotal)}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={overdueCompany.length > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueExpenseChart />
        <ServiceRevenueChart />
      </div>

      {/* Secondary Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChannelChart />
        <AccountsOverview />
        <InvestmentSummary />
      </div>
    </div>
  );
}
